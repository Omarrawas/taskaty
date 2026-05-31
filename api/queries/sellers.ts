import { db } from "../lib/firebase-admin";
import { COLLECTIONS } from "../lib/firestore-utils";

export async function listTopSellers(limit = 10) {
  if (!db) return [];
  
  // Query users with role "seller"
  const snapshot = await db.collection(COLLECTIONS.USERS)
    .where("role", "==", "seller")
    .get();
    
  const sellers = snapshot.docs.map(doc => {
    const userData = doc.data();
    return {
      id: doc.id,
      unionId: doc.id,
      name: userData.name,
      avatar: userData.avatar,
      email: userData.email,
      rating: userData.rating || "4.5",
      totalOrders: userData.totalOrders || 0,
      level: userData.level || "بائع موثوق",
      createdAt: userData.createdAt,
    };
  });
  
  // Sort by totalOrders and limit
  sellers.sort((a: any, b: any) => (b.totalOrders || 0) - (a.totalOrders || 0));
  
  return sellers.slice(0, limit);
}

export async function findSellerById(userId: string) {
  if (!db) return null;
  
  const userDoc = await db.collection(COLLECTIONS.USERS).doc(userId).get();
  if (!userDoc.exists) return null;
  
  const userData = userDoc.data();
  
  // Get seller's services count
  const servicesSnapshot = await db.collection(COLLECTIONS.SERVICES)
    .where("sellerId", "==", userId)
    .where("status", "==", "active")
    .get();
  
  return {
    id: userId,
    unionId: userId,
    name: userData?.name,
    avatar: userData?.avatar,
    email: userData?.email,
    role: userData?.role,
    createdAt: userData?.createdAt,
    totalOrders: userData?.totalOrders || servicesSnapshot.size,
    rating: userData?.rating || "4.5",
    level: userData?.level || "بائع موثوق",
    bio: userData?.bio || "بائع على منصة Taskaty",
    skills: userData?.skills || [],
  };
}

export async function upsertSellerProfile(userId: string, data: any) {
  if (!db) return;
  
  // Update user document with seller profile data
  await db.collection(COLLECTIONS.USERS).doc(userId).set({
    ...data,
    role: "seller",
    updatedAt: new Date().toISOString()
  }, { merge: true });
}
