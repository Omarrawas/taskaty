import { db } from "../lib/firebase-admin";
import { COLLECTIONS } from "../lib/firestore-utils";

export async function listNotifications(userId: string, limit = 50) {
  if (!db) return [];
  const snapshot = await db.collection(COLLECTIONS.USERS)
    .doc(userId)
    .collection(COLLECTIONS.NOTIFICATIONS)
    .orderBy("createdAt", "desc")
    .limit(limit)
    .get();
    
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export async function countUnreadNotifications(userId: string): Promise<number> {
  if (!db) return 0;
  const snapshot = await db.collection(COLLECTIONS.USERS)
    .doc(userId)
    .collection(COLLECTIONS.NOTIFICATIONS)
    .where("isRead", "==", false)
    .count()
    .get();
    
  return snapshot.data().count;
}

export async function markNotificationRead(userId: string, notificationId: string) {
  if (!db) return;
  await db.collection(COLLECTIONS.USERS)
    .doc(userId)
    .collection(COLLECTIONS.NOTIFICATIONS)
    .doc(notificationId)
    .update({ isRead: true });
}

export async function markAllNotificationsRead(userId: string) {
  if (!db) return;
  const batch = db.batch();
  const snapshot = await db.collection(COLLECTIONS.USERS)
    .doc(userId)
    .collection(COLLECTIONS.NOTIFICATIONS)
    .where("isRead", "==", false)
    .get();
    
  snapshot.docs.forEach(doc => {
    batch.update(doc.ref, { isRead: true });
  });
  
  await batch.commit();
}

export async function createNotification(userId: string, data: {
  title: string;
  message: string;
  type: string;
  referenceId?: string;
  referenceType?: string;
}) {
  if (!db) return;
  await db.collection(COLLECTIONS.USERS)
    .doc(userId)
    .collection(COLLECTIONS.NOTIFICATIONS)
    .add({
      ...data,
      isRead: false,
      createdAt: new Date().toISOString(),
    });
}
