import { db } from "./firebase-admin";

export const COLLECTIONS = {
  USERS: "users",
  SELLER_PROFILES: "seller_profiles",
  CATEGORIES: "categories",
  SERVICES: "services",
  ORDERS: "orders",
  WALLETS: "wallets",
  WITHDRAWAL_REQUESTS: "withdrawal_requests",
  PAYMENT_PROOFS: "payment_proofs",
  CONVERSATIONS: "conversations",
  REVIEWS: "reviews",
  DISPUTES: "disputes",
  NOTIFICATIONS: "notifications",
  FAVORITES: "favorites",
  REFERRALS: "referrals",
};

export async function getDoc<T>(collection: string, id: string): Promise<T | null> {
  if (!db) return null;
  const doc = await db.collection(collection).doc(id).get();
  return doc.exists ? (doc.data() as T) : null;
}

export async function setDoc(collection: string, id: string, data: any, merge = true) {
  if (!db) return;
  await db.collection(collection).doc(id).set(data, { merge });
}

export async function queryCollection<T>(
  collection: string,
  queries: { field: string; operator: any; value: any }[] = []
): Promise<T[]> {
  if (!db) return [];
  let q: any = db.collection(collection);
  for (const { field, operator, value } of queries) {
    q = q.where(field, operator, value);
  }
  const snapshot = await q.get();
  return snapshot.docs.map((doc: any) => ({ ...doc.data(), id: doc.id }) as T);
}
