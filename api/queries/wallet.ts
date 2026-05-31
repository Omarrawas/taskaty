import { db } from "../lib/firebase-admin";
import { COLLECTIONS } from "../lib/firestore-utils";
import { createNotification } from "./notifications";

export async function getWalletByUserId(userId: string, transaction?: any) {
  if (!db) return null;
  const walletRef = db.collection(COLLECTIONS.WALLETS).doc(userId);
  const doc = transaction ? await transaction.get(walletRef) : await walletRef.get();
  return doc.exists ? doc.data() : null;
}

export async function ensureWallet(userId: string, transaction?: any) {
  const existing = await getWalletByUserId(userId, transaction);
  if (existing) return existing;
  
  if (!db) throw new Error("Database not initialized");
  const walletRef = db.collection(COLLECTIONS.WALLETS).doc(userId);
  const newWallet = {
    userId,
    balance: "0",
    createdAt: new Date().toISOString(),
  };
  
  if (transaction) {
    transaction.set(walletRef, newWallet);
  } else {
    await walletRef.set(newWallet);
  }
  return newWallet;
}

export async function getWalletTransactions(userId: string, limit = 30) {
  if (!db) return [];
  const snapshot = await db.collection(COLLECTIONS.WALLETS).doc(userId)
    .collection("transactions")
    .orderBy("createdAt", "desc")
    .limit(limit)
    .get();
    
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export async function createDepositRequest(
  userId: string,
  amount: string,
  method: any,
  transactionNumber?: string,
  senderPhone?: string,
) {
  if (!db) return;
  const data: Record<string, any> = {
    userId,
    amount,
    method,
    status: "pending",
    createdAt: new Date().toISOString(),
  };
  if (transactionNumber) data.transactionNumber = transactionNumber;
  if (senderPhone) data.senderPhone = senderPhone;
  await db.collection(COLLECTIONS.PAYMENT_PROOFS).add(data);
}

export async function createWithdrawalRequest(
  userId: string,
  amount: string,
  method: any,
  accountNumber?: string,
  accountName?: string,
) {
  if (!db) return;
  const data: Record<string, any> = {
    userId,
    amount,
    method,
    status: "pending",
    createdAt: new Date().toISOString(),
  };
  if (accountNumber) data.accountNumber = accountNumber;
  if (accountName) data.accountName = accountName;
  await db.collection(COLLECTIONS.WITHDRAWAL_REQUESTS).add(data);
}

export async function listWithdrawalRequests(status?: string) {
  if (!db) return [];
  let query: any = db.collection(COLLECTIONS.WITHDRAWAL_REQUESTS);
  if (status) query = query.where("status", "==", status);
  
  const snapshot = await query.orderBy("createdAt", "desc").get();
  
  const results = await Promise.all(snapshot.docs.map(async (doc: any) => {
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

export async function updateWithdrawalRequest(
  id: string,
  status: "approved" | "rejected",
  adminNote?: string,
) {
  if (!db) return;

  await db.runTransaction(async (transaction) => {
    const withdrawalRef = db!.collection(COLLECTIONS.WITHDRAWAL_REQUESTS).doc(id);
    const withdrawalDoc = await transaction.get(withdrawalRef);

    if (!withdrawalDoc.exists) {
      throw new Error("طلب السحب غير موجود");
    }

    const withdrawal = withdrawalDoc.data();
    if (withdrawal?.status !== "pending") {
      throw new Error("تمت معالجة طلب السحب مسبقاً");
    }

    const processedAt = new Date().toISOString();

    if (status === "approved") {
      const walletRef = db!.collection(COLLECTIONS.WALLETS).doc(withdrawal.userId);
      const walletDoc = await transaction.get(walletRef);
      const currentBalance = parseFloat(walletDoc.data()?.balance ?? "0");
      const amount = parseFloat(withdrawal.amount ?? "0");

      if (currentBalance < amount) {
        throw new Error("رصيد المستخدم غير كافٍ لاعتماد طلب السحب");
      }

      const newBalance = (currentBalance - amount).toFixed(2);
      transaction.set(walletRef, { balance: newBalance }, { merge: true });

      const txRef = walletRef.collection("transactions").doc();
      transaction.set(txRef, {
        type: "withdrawal",
        amount: String(-amount),
        balanceAfter: newBalance,
        referenceType: "withdrawal",
        referenceId: id,
        description: "سحب رصيد معتمد من الإدارة",
        status: "completed",
        createdAt: processedAt,
      });
    }

    transaction.update(withdrawalRef, {
      status,
      adminNote,
      processedAt,
    });
  });

  // Send notification to user
  const withdrawalDoc = await db.collection(COLLECTIONS.WITHDRAWAL_REQUESTS).doc(id).get();
  const withdrawalData = withdrawalDoc.data();
  
  if (withdrawalData) {
    const amount = parseFloat(withdrawalData.amount ?? "0");
    await createNotification(withdrawalData.userId, {
      title: status === "approved" ? "تم اعتماد طلب السحب" : "تم رفض طلب السحب",
      message: status === "approved" 
        ? `تم اعتماد طلب السحب بمبلغ ${amount.toLocaleString()} ل.س وسيتم تحويله قريباً`
        : `تم رفض طلب السحب بمبلغ ${amount.toLocaleString()} ل.س${adminNote ? ` - السبب: ${adminNote}` : ""}`,
      type: "payment",
      referenceId: id,
      referenceType: "withdrawal",
    });
  }
}

export async function listPaymentProofs() {
  if (!db) return [];
  
  const snapshot = await db.collection(COLLECTIONS.PAYMENT_PROOFS)
    .orderBy("createdAt", "desc")
    .get();
    
  const results = await Promise.all(snapshot.docs.map(async (doc: any) => {
    const data = doc.data();
    const userDoc = await db!.collection(COLLECTIONS.USERS).doc(data.userId).get();
    const userData = userDoc.data();
    return {
      id: doc.id,
      ...data,
      userName: userData?.name,
    };
  }));
  
  return results;
}

export async function approvePaymentProof(id: string, userId: string, amount: string) {
  if (!db) return;
  
  await db.runTransaction(async (transaction) => {
    const walletRef = db!.collection(COLLECTIONS.WALLETS).doc(userId);
    const walletDoc = await transaction.get(walletRef);
    
    let currentBalance = 0;
    if (walletDoc.exists) {
      currentBalance = parseFloat(walletDoc.data()?.balance ?? "0");
    }
    
    const newBalance = (currentBalance + parseFloat(amount)).toFixed(2);
    
    transaction.set(walletRef, { balance: newBalance }, { merge: true });
    
    const txRef = walletRef.collection("transactions").doc();
    transaction.set(txRef, {
      type: "deposit",
      amount,
      balanceAfter: newBalance,
      description: "إيداع معتمد من الإدارة",
      status: "completed",
      createdAt: new Date().toISOString(),
    });
    
    const proofRef = db!.collection(COLLECTIONS.PAYMENT_PROOFS).doc(id);
    transaction.update(proofRef, {
      status: "approved",
      reviewedAt: new Date().toISOString(),
    });
  });

  // Send notification to user
  await createNotification(userId, {
    title: "تم شحن رصيدك",
    message: `تم اعتماد إيداع بمبلغ ${parseFloat(amount).toLocaleString()} ل.س وإضافته لمحفظتك`,
    type: "payment",
    referenceId: id,
    referenceType: "deposit",
  });
}

export async function adjustUserBalance(userId: string, amount: string, description: string) {
  if (!db) return;
  
  await db.runTransaction(async (transaction) => {
    const walletRef = db!.collection(COLLECTIONS.WALLETS).doc(userId);
    const walletDoc = await transaction.get(walletRef);
    
    let currentBalance = 0;
    if (walletDoc.exists) {
      currentBalance = parseFloat(walletDoc.data()?.balance ?? "0");
    }
    
    const adjustAmount = parseFloat(amount);
    const newBalance = (currentBalance + adjustAmount).toFixed(2);
    
    transaction.set(walletRef, { balance: newBalance }, { merge: true });
    
    const txRef = walletRef.collection("transactions").doc();
    transaction.set(txRef, {
      type: adjustAmount >= 0 ? "deposit" : "withdrawal",
      amount: String(Math.abs(adjustAmount)),
      balanceAfter: newBalance,
      description: description || "تعديل رصيد يدوي من الإدارة",
      status: "completed",
      createdAt: new Date().toISOString(),
    });
  });
}
