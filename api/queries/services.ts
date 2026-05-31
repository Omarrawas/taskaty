import { db } from "../lib/firebase-admin";
import { COLLECTIONS } from "../lib/firestore-utils";

export type ServiceFilters = {
  categorySlug?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  sort?: "popular" | "newest" | "rating" | "price_asc" | "price_desc";
  search?: string;
  page?: number;
  limit?: number;
};

export async function listServices(filters: ServiceFilters = {}) {
  if (!db) return { rows: [], total: 0 };
  
  const {
    categorySlug,
    minPrice,
    maxPrice,
    minRating,
    sort = "popular",
    search,
    page = 1,
    limit = 12,
  } = filters;

  // Simple query without composite indexes - filter in JavaScript
  const snapshot = await db.collection(COLLECTIONS.SERVICES)
    .where("status", "==", "active")
    .get();
  
  let services = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

  // Apply filters in JavaScript
  if (categorySlug) {
    services = services.filter((s: any) => s.categorySlug === categorySlug);
  }
  if (minPrice !== undefined) {
    services = services.filter((s: any) => parseFloat(s.price) >= minPrice);
  }
  if (maxPrice !== undefined) {
    services = services.filter((s: any) => parseFloat(s.price) <= maxPrice);
  }
  if (minRating !== undefined) {
    services = services.filter((s: any) => parseFloat(s.rating || "0") >= minRating);
  }
  if (search) {
    const searchLower = search.toLowerCase();
    services = services.filter((s: any) => 
      s.title?.toLowerCase().includes(searchLower) ||
      s.description?.toLowerCase().includes(searchLower)
    );
  }

  // Sort in JavaScript
  switch (sort) {
    case "price_asc":
      services.sort((a: any, b: any) => parseFloat(a.price) - parseFloat(b.price));
      break;
    case "price_desc":
      services.sort((a: any, b: any) => parseFloat(b.price) - parseFloat(a.price));
      break;
    case "rating":
      services.sort((a: any, b: any) => parseFloat(b.rating || "0") - parseFloat(a.rating || "0"));
      break;
    case "newest":
      services.sort((a: any, b: any) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
      break;
    case "popular":
    default:
      services.sort((a: any, b: any) => (b.totalOrders || 0) - (a.totalOrders || 0));
      break;
  }

  const total = services.length;
  const offset = (page - 1) * limit;
  const rows = services.slice(offset, offset + limit);

  return { rows, total };
}

export async function listFeaturedServices(limit = 8) {
  if (!db) return [];
  
  // Simple query without composite index
  const snapshot = await db.collection(COLLECTIONS.SERVICES)
    .where("status", "==", "active")
    .get();
    
  // Filter and sort in JavaScript
  let services = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  services = services.filter((s: any) => s.featured === true);
  services.sort((a: any, b: any) => (b.totalOrders || 0) - (a.totalOrders || 0));
  
  return services.slice(0, limit);
}

export async function findServiceBySlug(slug: string) {
  if (!db) return null;
  const snapshot = await db.collection(COLLECTIONS.SERVICES)
    .where("slug", "==", slug)
    .limit(1)
    .get();
    
  if (snapshot.empty) return null;
  const doc = snapshot.docs[0];
  return { id: doc.id, ...doc.data() };
}

export async function listServicesBySeller(sellerId: string | number) {
  if (!db) return [];
  const snapshot = await db.collection(COLLECTIONS.SERVICES)
    .where("sellerId", "==", String(sellerId))
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

export async function createService(data: any) {
  if (!db) return;
  const docRef = db.collection(COLLECTIONS.SERVICES).doc();
  await docRef.set({
    ...data,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
  return docRef.id;
}

export async function updateService(id: string, sellerId: string | number, data: any) {
  if (!db) return;
  const serviceRef = db.collection(COLLECTIONS.SERVICES).doc(id);
  const doc = await serviceRef.get();
  if (doc.exists && doc.data()?.sellerId === String(sellerId)) {
    await serviceRef.update({
      ...data,
      updatedAt: new Date().toISOString(),
    });
  }
}

export async function deleteService(id: string, sellerId: string | number) {
  if (!db) return;
  const serviceRef = db.collection(COLLECTIONS.SERVICES).doc(id);
  const doc = await serviceRef.get();
  if (doc.exists && doc.data()?.sellerId === String(sellerId)) {
    await serviceRef.delete();
  }
}

export async function adminUpdateService(id: string, data: any) {
  if (!db) return;
  await db.collection(COLLECTIONS.SERVICES).doc(id).update({
    ...data,
    updatedAt: new Date().toISOString(),
  });
}
