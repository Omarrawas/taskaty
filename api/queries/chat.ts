import { db } from "../lib/firebase-admin";
import { COLLECTIONS } from "../lib/firestore-utils";
import { createNotification } from "./notifications";

export async function listConversations(userId: string) {
  if (!db) return [];
  
  // In Firestore, we query conversations where the user is a participant
  // Since we don't have an array of members yet, let's look at buyerId or sellerId
  const snapshot = await db.collection(COLLECTIONS.CONVERSATIONS)
    .where("participants", "array-contains", userId)
    .orderBy("lastMessageAt", "desc")
    .get();
    
  const results = await Promise.all(snapshot.docs.map(async (doc) => {
    const data = doc.data();
    const otherId = data.buyerId === userId ? data.sellerId : data.buyerId;
    const userDoc = await db!.collection(COLLECTIONS.USERS).doc(otherId).get();
    const userData = userDoc.data();
    
    return {
      id: doc.id,
      ...data,
      otherName: userData?.name,
      otherAvatar: userData?.avatar,
    };
  }));
  
  return results;
}

export async function findOrCreateConversation(participantA: string, participantB: string) {
  if (!db) return null;
  const ids = [participantA, participantB].sort();
  const convId = ids.join("_");
  
  const convRef = db.collection(COLLECTIONS.CONVERSATIONS).doc(convId);
  const doc = await convRef.get();
  
  if (doc.exists) return { id: doc.id, ...doc.data() };
  
  const newConv = {
    buyerId: ids[0],
    sellerId: ids[1],
    participants: ids,
    createdAt: new Date().toISOString(),
    lastMessage: "",
    lastMessageAt: new Date().toISOString(),
  };
  
  await convRef.set(newConv);
  return { id: convId, ...newConv };
}

export async function listMessages(conversationId: string, limit = 50) {
  if (!db) return [];
  const snapshot = await db.collection(COLLECTIONS.CONVERSATIONS).doc(conversationId)
    .collection("messages")
    .orderBy("createdAt", "desc")
    .limit(limit)
    .get();
    
  const messages = await Promise.all(snapshot.docs.map(async (doc) => {
    const data = doc.data();
    const userDoc = await db!.collection(COLLECTIONS.USERS).doc(data.senderId).get();
    const userData = userDoc.data();
    
    return {
      id: doc.id,
      ...data,
      senderName: userData?.name,
      senderAvatar: userData?.avatar,
    };
  }));
  
  return messages;
}

export async function createMessage(data: {
  conversationId: string;
  senderId: string;
  content: string;
}) {
  if (!db) return;
  
  const batch = db.batch();
  
  const msgRef = db.collection(COLLECTIONS.CONVERSATIONS).doc(data.conversationId)
    .collection("messages").doc();
    
  batch.set(msgRef, {
    senderId: data.senderId,
    content: data.content,
    isRead: false,
    createdAt: new Date().toISOString(),
  });
  
  const convRef = db.collection(COLLECTIONS.CONVERSATIONS).doc(data.conversationId);
  batch.update(convRef, {
    lastMessage: data.content.substring(0, 100),
    lastMessageAt: new Date().toISOString(),
  });
  
  await batch.commit();

  // Get conversation to find receiver
  const convDoc = await db.collection(COLLECTIONS.CONVERSATIONS).doc(data.conversationId).get();
  const convData = convDoc.data();
  
  if (convData) {
    const receiverId = convData.buyerId === data.senderId ? convData.sellerId : convData.buyerId;
    
    // Get sender name
    const senderDoc = await db.collection(COLLECTIONS.USERS).doc(data.senderId).get();
    const senderName = senderDoc.data()?.name || "مستخدم";
    
    // Send notification to receiver
    await createNotification(receiverId, {
      message: `رسالة جديدة من ${senderName}`,
      title: "رسالة جديدة",
      type: "message",
      referenceId: data.conversationId,
      referenceType: "conversation",
    });
  }
}
