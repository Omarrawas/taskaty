import { db } from "../lib/firebase-admin";
import { COLLECTIONS } from "../lib/firestore-utils";

export async function addFavorite(userId: string, serviceId: string) {
  if (!db) throw new Error("Database not initialized");
  
  // Check if already favorited
  const existing = await db.collection(COLLECTIONS.FAVORITES)
    .where("userId", "==", userId)
    .where("serviceId", "==", serviceId)
    .get();
  
  if (!existing.empty) {
    throw new Error("هذه الخدمة موجودة بالفعل في المفضلة");
  }
  
  // Get service data for denormalization
  const serviceDoc = await db.collection(COLLECTIONS.SERVICES).doc(serviceId).get();
  const serviceData = serviceDoc.data();
  
  await db.collection(COLLECTIONS.FAVORITES).add({
    userId,
    serviceId,
    serviceTitle: serviceData?.title || "",
    serviceSlug: serviceData?.slug || "",
    servicePrice: serviceData?.price || "0",
    serviceImage: serviceData?.images?.[0] || "",
    serviceRating: serviceData?.rating || "0",
    createdAt: new Date().toISOString(),
  });
  
  return { success: true };
}

export async function removeFavorite(userId: string, serviceId: string) {
  if (!db) throw new Error("Database not initialized");
  
  const snapshot = await db.collection(COLLECTIONS.FAVORITES)
    .where("userId", "==", userId)
    .where("serviceId", "==", serviceId)
    .get();
  
  if (snapshot.empty) {
    throw new Error("هذه الخدمة غير موجودة في المفضلة");
  }
  
  // Delete all matching documents (should be only one)
  const batch = db.batch();
  snapshot.docs.forEach(doc => {
    batch.delete(doc.ref);
  });
  await batch.commit();
  
  return { success: true };
}

export async function listFavorites(userId: string) {
  if (!db) return [];
  
  const snapshot = await db.collection(COLLECTIONS.FAVORITES)
    .where("userId", "==", userId)
    .get();
  
  // Sort in JavaScript to avoid composite index requirement
  const favorites = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  favorites.sort((a: any, b: any) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
  
  return favorites;
}

export async function isFavorited(userId: string, serviceId: string): Promise<boolean> {
  if (!db) return false;
  
  const snapshot = await db.collection(COLLECTIONS.FAVORITES)
    .where("userId", "==", userId)
    .where("serviceId", "==", serviceId)
    .limit(1)
    .get();
  
  return !snapshot.empty;
}

export async function toggleFavorite(userId: string, serviceId: string) {
  if (!db) throw new Error("Database not initialized");
  
  const snapshot = await db.collection(COLLECTIONS.FAVORITES)
    .where("userId", "==", userId)
    .where("serviceId", "==", serviceId)
    .get();
  
  if (!snapshot.empty) {
    // Remove from favorites
    const batch = db.batch();
    snapshot.docs.forEach(doc => {
      batch.delete(doc.ref);
    });
    await batch.commit();
    return { favorited: false };
  } else {
    // Add to favorites
    const serviceDoc = await db.collection(COLLECTIONS.SERVICES).doc(serviceId).get();
    const serviceData = serviceDoc.data();
    
    await db.collection(COLLECTIONS.FAVORITES).add({
      userId,
      serviceId,
      serviceTitle: serviceData?.title || "",
      serviceSlug: serviceData?.slug || "",
      servicePrice: serviceData?.price || "0",
      serviceImage: serviceData?.images?.[0] || "",
      serviceRating: serviceData?.rating || "0",
      createdAt: new Date().toISOString(),
    });
    
    return { favorited: true };
  }
}

export async function countFavorites(userId: string): Promise<number> {
  if (!db) return 0;
  
  const snapshot = await db.collection(COLLECTIONS.FAVORITES)
    .where("userId", "==", userId)
    .count()
    .get();
  
  return snapshot.data().count;
}
