import { db } from "../lib/firebase-admin";
import { COLLECTIONS } from "../lib/firestore-utils";
import { nanoid } from "nanoid";

const REFERRAL_REWARD = 500; // مكافأة الدعوة بالليرات السورية

export async function getOrCreateReferralCode(userId: string): Promise<string> {
  if (!db) throw new Error("Database not initialized");
  
  // Check if user already has a referral code
  const existing = await db.collection(COLLECTIONS.REFERRALS)
    .where("userId", "==", userId)
    .limit(1)
    .get();
  
  if (!existing.empty) {
    return existing.docs[0].data().code;
  }
  
  // Generate new unique code
  const code = `TSK-${nanoid(8).toUpperCase()}`;
  
  await db.collection(COLLECTIONS.REFERRALS).add({
    userId,
    code,
    totalReferrals: 0,
    totalRewards: 0,
    createdAt: new Date().toISOString(),
  });
  
  return code;
}

export async function getReferralStats(userId: string) {
  if (!db) return null;
  
  const snapshot = await db.collection(COLLECTIONS.REFERRALS)
    .where("userId", "==", userId)
    .limit(1)
    .get();
  
  if (snapshot.empty) {
    return {
      code: await getOrCreateReferralCode(userId),
      totalReferrals: 0,
      totalRewards: 0,
      referredUsers: [],
    };
  }
  
  const referralDoc = snapshot.docs[0];
  const referralData = referralDoc.data();
  
  // Get list of referred users
  const referredUsers = await getReferredUsers(userId);
  
  return {
    code: referralData.code,
    totalReferrals: referralData.totalReferrals || 0,
    totalRewards: referralData.totalRewards || 0,
    referredUsers,
  };
}

export async function getReferredUsers(userId: string) {
  if (!db) return [];
  
  const snapshot = await db.collection(COLLECTIONS.USERS)
    .where("referredBy", "==", userId)
    .orderBy("createdAt", "desc")
    .get();
  
  return snapshot.docs.map(doc => ({
    id: doc.id,
    name: doc.data().name || "مستخدم جديد",
    email: doc.data().email || "",
    createdAt: doc.data().createdAt,
  }));
}

export async function processReferral(newUserId: string, referralCode: string) {
  if (!db) return;
  
  // Find the referral document with this code
  const referralSnapshot = await db.collection(COLLECTIONS.REFERRALS)
    .where("code", "==", referralCode)
    .limit(1)
    .get();
  
  if (referralSnapshot.empty) return;
  
  const referralDoc = referralSnapshot.docs[0];
  const referrerUserId = referralDoc.data().userId;
  
  // Don't allow self-referral
  if (referrerUserId === newUserId) return;
  
  // Update new user with referral info
  await db.collection(COLLECTIONS.USERS).doc(newUserId).update({
    referredBy: referrerUserId,
    referralCode,
  });
  
  // Update referrer stats
  await db.runTransaction(async (transaction) => {
    const referrerRef = db!.collection(COLLECTIONS.USERS).doc(referrerUserId);
    const referrerDoc = await transaction.get(referrerRef);
    
    if (referrerDoc.exists) {
      const currentRewards = parseFloat(referrerDoc.data()?.referralRewards || "0");
      const newRewards = currentRewards + REFERRAL_REWARD;
      
      transaction.update(referrerRef, {
        referralRewards: String(newRewards),
      });
    }
    
    // Update referral stats
    transaction.update(referralDoc.ref, {
      totalReferrals: (referralDoc.data().totalReferrals || 0) + 1,
      totalRewards: (referralDoc.data().totalRewards || 0) + REFERRAL_REWARD,
      lastReferralAt: new Date().toISOString(),
    });
  });
  
  // Add reward to referrer's wallet
  const walletRef = db.collection(COLLECTIONS.WALLETS).doc(referrerUserId);
  const walletDoc = await walletRef.get();
  
  if (walletDoc.exists) {
    const currentBalance = parseFloat(walletDoc.data()?.balance || "0");
    const newBalance = (currentBalance + REFERRAL_REWARD).toFixed(2);
    
    await walletRef.update({ balance: newBalance });
    
    // Log the transaction
    await walletRef.collection("transactions").add({
      type: "referral_reward",
      amount: String(REFERRAL_REWARD),
      balanceAfter: newBalance,
      description: "مكافأة دعوة مستخدم جديد",
      status: "completed",
      createdAt: new Date().toISOString(),
    });
  }
  
  // Send notification to referrer
  const newUserDoc = await db.collection(COLLECTIONS.USERS).doc(newUserId).get();
  const newUserName = newUserDoc.data()?.name || "مستخدم جديد";
  
  await db.collection(COLLECTIONS.USERS).doc(referrerUserId)
    .collection(COLLECTIONS.NOTIFICATIONS).add({
      title: "مكافأة دعوة جديدة!",
      message: `تم تسجيل ${newUserName} عبر رابط الدعوة الخاص بك.حصلت على ${REFERRAL_REWARD} ل.س مكافأة!`,
      type: "referral",
      referenceId: newUserId,
      referenceType: "user",
      isRead: false,
      createdAt: new Date().toISOString(),
    });
}

export async function getReferralLink(userId: string): Promise<string> {
  const code = await getOrCreateReferralCode(userId);
  // In production, this would be the actual domain
  return `https://taskaty.app/register?ref=${code}`;
}

export async function validateReferralCode(code: string): Promise<boolean> {
  if (!db) return false;
  
  const snapshot = await db.collection(COLLECTIONS.REFERRALS)
    .where("code", "==", code)
    .limit(1)
    .get();
  
  return !snapshot.empty;
}
