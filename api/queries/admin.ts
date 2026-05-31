import { db } from "../lib/firebase-admin";
import { COLLECTIONS } from "../lib/firestore-utils";

export async function getAdminStats() {
  if (!db) return null;

  const usersCount = await db.collection(COLLECTIONS.USERS).count().get();
  const servicesCount = await db.collection(COLLECTIONS.SERVICES).count().get();
  const ordersCount = await db.collection(COLLECTIONS.ORDERS).count().get();
  const disputesCount = await db.collection(COLLECTIONS.DISPUTES).where("status", "==", "open").count().get();

  const completedOrders = await db.collection(COLLECTIONS.ORDERS).where("status", "==", "completed").count().get();
  const totalOrders = ordersCount.data().count;
  const completionRate = totalOrders > 0 ? Math.round((completedOrders.data().count / totalOrders) * 100) : 0;

  // Calculate wallet balance sum manually (balance is stored as string)
  const walletsSnapshot = await db.collection(COLLECTIONS.WALLETS).get();
  let totalWalletBalance = 0;
  walletsSnapshot.docs.forEach(doc => {
    const balance = parseFloat(doc.data().balance || "0");
    totalWalletBalance += balance;
  });

  // Calculate deposits sum manually (amount is stored as string)
  const depositsSnapshot = await db.collection(COLLECTIONS.PAYMENT_PROOFS)
    .where("status", "==", "approved")
    .get();
  let totalDeposited = 0;
  depositsSnapshot.docs.forEach(doc => {
    const amount = parseFloat(doc.data().amount || "0");
    totalDeposited += amount;
  });

  // Calculate withdrawals sum manually (amount is stored as string)
  const withdrawalsSnapshot = await db.collection(COLLECTIONS.WITHDRAWAL_REQUESTS)
    .where("status", "==", "approved")
    .get();
  let totalWithdrawn = 0;
  withdrawalsSnapshot.docs.forEach(doc => {
    const amount = parseFloat(doc.data().amount || "0");
    totalWithdrawn += amount;
  });

  // Calculate sales sum manually (totalAmount is stored as string)
  const salesSnapshot = await db.collection(COLLECTIONS.ORDERS)
    .where("status", "==", "completed")
    .get();
  let totalSales = 0;
  salesSnapshot.docs.forEach(doc => {
    const amount = parseFloat(doc.data().totalAmount || "0");
    totalSales += amount;
  });

  const pendingDeposits = await db.collection(COLLECTIONS.PAYMENT_PROOFS).where("status", "==", "pending").count().get();

  return {
    users: usersCount.data().count,
    services: servicesCount.data().count,
    orders: totalOrders,
    disputes: disputesCount.data().count,
    completionRate,
    totalWalletBalance: totalWalletBalance,
    totalDeposited: totalDeposited,
    totalWithdrawn: totalWithdrawn,
    totalSales: totalSales,
    pendingDepositsCount: pendingDeposits.data().count,
  };
}

export async function listUsers(limit = 50) {
  if (!db) return [];
  const snapshot = await db.collection(COLLECTIONS.USERS)
    .orderBy("createdAt", "desc")
    .limit(limit)
    .get();
    
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export async function listPendingServices() {
  if (!db) return [];
  const snapshot = await db.collection(COLLECTIONS.SERVICES)
    .where("status", "==", "pending")
    .get();
    
  // Sort in JavaScript to avoid composite index requirement
  const services = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  services.sort((a: any, b: any) => {
    const dateA = new Date(a.createdAt || 0).getTime();
    const dateB = new Date(b.createdAt || 0).getTime();
    return dateB - dateA;
  });
  
  return services;
}

export async function approveService(id: string) {
  if (!db) return;
  await db.collection(COLLECTIONS.SERVICES).doc(id).update({ status: "active" });
}

export async function rejectService(id: string) {
  if (!db) return;
  await db.collection(COLLECTIONS.SERVICES).doc(id).update({ status: "rejected" });
}

export async function listAllOrders(limit = 50) {
  if (!db) return [];
  const snapshot = await db.collection(COLLECTIONS.ORDERS)
    .orderBy("createdAt", "desc")
    .limit(limit)
    .get();
    
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export async function listWithdrawalRequests() {
  if (!db) return [];
  const snapshot = await db.collection(COLLECTIONS.WITHDRAWAL_REQUESTS)
    .orderBy("createdAt", "desc")
    .get();
    
  const results = await Promise.all(snapshot.docs.map(async (doc) => {
    const data = doc.data();
    const userDoc = await db!.collection(COLLECTIONS.USERS).doc(data.userId).get();
    const userData = userDoc.data();
    return {
      id: doc.id,
      ...data,
      userName: userData?.name,
      userAvatar: userData?.avatar,
    };
  }));
  
  return results;
}

export async function updateUserRole(userId: string, role: string) {
  if (!db) return;
  await db.collection(COLLECTIONS.USERS).doc(userId).update({ role });
}

export async function deleteUser(userId: string) {
  if (!db) return;
  // Also delete their wallet and services for cleanup
  await db.collection(COLLECTIONS.USERS).doc(userId).delete();
  await db.collection(COLLECTIONS.WALLETS).doc(userId).delete();
  
  // Note: deleting services and other related data would be better done in a cloud function or batch,
  // but for simple "fake user" deletion, this is a start.
}
