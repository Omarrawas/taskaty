import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  doc,
  addDoc,
  serverTimestamp,
  setDoc,
  updateDoc
} from "firebase/firestore";
import { useAuth } from "./useAuth";

export function useChat(conversationId?: string) {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Listen to conversations
  useEffect(() => {
    if (!user || !user.unionId) return;

    // Simple query without composite index
    const q = query(
      collection(db, "conversations"),
      where("participants", "array-contains", user.unionId)
    );

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const convs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // Fetch other user data for each conversation
      const convsWithUserData = await Promise.all(
        convs.map(async (conv: any) => {
          const otherId = conv.participants?.find((p: string) => p !== user.unionId);
          if (otherId) {
            try {
              const userDoc = await import("firebase/firestore").then(mod => 
                mod.getDoc(mod.doc(db, "users", otherId))
              );
              if (userDoc.exists()) {
                const userData = userDoc.data();
                return {
                  ...conv,
                  otherName: userData.name,
                  otherAvatar: userData.avatar,
                  otherId: otherId,
                };
              }
            } catch (err) {
              // silently ignore
            }
          }
          return conv;
        })
      );
      
      // Sort in JavaScript to avoid composite index
      convsWithUserData.sort((a: any, b: any) => {
        const dateA = a.lastMessageAt?.toDate?.() || new Date(0);
        const dateB = b.lastMessageAt?.toDate?.() || new Date(0);
        return dateB.getTime() - dateA.getTime();
      });
      setConversations(convsWithUserData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  // Listen to messages
  useEffect(() => {
    if (!conversationId) return;

    // Simple query without composite index
    const q = query(
      collection(db, "conversations", conversationId, "messages")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      // Sort in JavaScript
      msgs.sort((a: any, b: any) => {
        const dateA = a.createdAt?.toDate?.() || new Date(0);
        const dateB = b.createdAt?.toDate?.() || new Date(0);
        return dateA.getTime() - dateB.getTime();
      });
      setMessages(msgs);
    });

    return () => unsubscribe();
  }, [conversationId]);

  const sendMessage = async (receiverUnionId: string, content: string) => {
    if (!user) return;

    const participants = [user.unionId, receiverUnionId].sort();
    const convId = participants.join("_");
    const convRef = doc(db, "conversations", convId);

    // Ensure conversation exists with buyerId and sellerId
    await setDoc(convRef, {
      participants,
      buyerId: participants[0],
      sellerId: participants[1],
      lastMessage: content,
      lastMessageAt: serverTimestamp(),
      createdAt: serverTimestamp(),
    }, { merge: true });

    // Add message
    await addDoc(collection(convRef, "messages"), {
      senderId: user.unionId,
      content,
      createdAt: serverTimestamp(),
    });

    await updateDoc(convRef, {
      lastMessage: content,
      lastMessageAt: serverTimestamp(),
    });

    // Send notification to receiver
    try {
      const notificationRef = collection(db, "users", receiverUnionId, "notifications");
      await addDoc(notificationRef, {
        title: "رسالة جديدة",
        message: `رسالة جديدة من ${user.name || "مستخدم"}`,
        type: "message",
        referenceId: convId,
        referenceType: "conversation",
        isRead: false,
        createdAt: serverTimestamp(),
      });
    } catch (err) {
      // notification failed silently
    }
  };

  return {
    conversations,
    messages,
    loading,
    sendMessage
  };
}
