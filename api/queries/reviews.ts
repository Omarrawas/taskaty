import { db } from "../lib/firebase-admin";
import { COLLECTIONS } from "../lib/firestore-utils";

export async function listReviewsByService(serviceId: string) {
  if (!db) return [];
  
  const serviceDoc = await db.collection(COLLECTIONS.SERVICES).doc(serviceId).get();
  if (!serviceDoc.exists) return [];
  const sellerId = serviceDoc.data()?.sellerId;

  const snapshot = await db.collection(COLLECTIONS.REVIEWS)
    .where("revieweeId", "==", sellerId)
    .where("type", "==", "buyer_to_seller")
    .get();

  const results = await Promise.all(snapshot.docs.map(async (doc) => {
    const data = doc.data();
    const reviewerDoc = await db!.collection(COLLECTIONS.USERS).doc(data.reviewerId).get();
    const userData = reviewerDoc.data();
    
    return {
      id: doc.id,
      ...data,
      reviewerName: userData?.name,
      reviewerAvatar: userData?.avatar,
    };
  }));

  results.sort((a, b) => {
    const dateA = new Date(a.createdAt || 0).getTime();
    const dateB = new Date(b.createdAt || 0).getTime();
    return dateB - dateA;
  });
  
  return results.slice(0, 20);
}

export async function listReviewsBySeller(sellerId: string) {
  if (!db) return [];
  
  const snapshot = await db.collection(COLLECTIONS.REVIEWS)
    .where("revieweeId", "==", sellerId)
    .where("type", "==", "buyer_to_seller")
    .get();

  const results = await Promise.all(snapshot.docs.map(async (doc) => {
    const data = doc.data();
    const reviewerDoc = await db!.collection(COLLECTIONS.USERS).doc(data.reviewerId).get();
    const userData = reviewerDoc.data();
    
    return {
      id: doc.id,
      ...data,
      reviewerName: userData?.name,
      reviewerAvatar: userData?.avatar,
    };
  }));

  results.sort((a, b) => {
    const dateA = new Date(a.createdAt || 0).getTime();
    const dateB = new Date(b.createdAt || 0).getTime();
    return dateB - dateA;
  });
  
  return results.slice(0, 20);
}

export async function findReviewByOrderAndReviewer(orderId: string, reviewerId: string) {
  if (!db) return null;

  const snapshot = await db.collection(COLLECTIONS.REVIEWS)
    .where("orderId", "==", orderId)
    .where("reviewerId", "==", reviewerId)
    .limit(1)
    .get();

  if (snapshot.empty) return null;
  const doc = snapshot.docs[0];
  return { id: doc.id, ...doc.data() };
}

export async function createReview(data: {
  orderId: string;
  reviewerId: string;
  revieweeId: string;
  type: "buyer_to_seller" | "seller_to_buyer";
  rating: number;
  comment?: string;
}) {
  if (!db) return;
  const createdAt = new Date().toISOString();

  await db.runTransaction(async (transaction) => {
    const reviewRef = db!.collection(COLLECTIONS.REVIEWS).doc(`${data.orderId}_${data.reviewerId}`);
    const existingDoc = await transaction.get(reviewRef);

    if (existingDoc.exists) {
      throw new Error("تم تقييم هذا الطلب مسبقاً");
    }

    transaction.set(reviewRef, {
      ...data,
      createdAt,
    });
  });
}
