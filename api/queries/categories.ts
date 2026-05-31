import { db } from "../lib/firebase-admin";
import { COLLECTIONS } from "../lib/firestore-utils";

export async function listCategories() {
  if (!db) return [];
  
  const snapshot = await db.collection(COLLECTIONS.CATEGORIES)
    .where("isActive", "==", true)
    .orderBy("sortOrder")
    .get();
    
  const categories = snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));

  // Note: in Firestore, we usually store the serviceCount on the category document itself
  // to avoid expensive aggregations on every request.
  return categories;
}

export async function findCategoryBySlug(slug: string) {
  if (!db) return null;
  
  const snapshot = await db.collection(COLLECTIONS.CATEGORIES)
    .where("slug", "==", slug)
    .limit(1)
    .get();
    
  if (snapshot.empty) return null;
  const doc = snapshot.docs[0];
  return { id: doc.id, ...doc.data() };
}
