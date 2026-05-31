import { db } from "../lib/firebase-admin";
import { COLLECTIONS } from "../lib/firestore-utils";
import { nanoid } from "nanoid";
import { createNotification } from "./notifications";

function generateOrderNumber() {
  return `ORD-${new Date().getFullYear()}-${nanoid(6).toUpperCase()}`;
}

export async function listOrdersByUser(userId: string, role: "buyer" | "seller") {
  if (!db) return [];
  
  const field = role === "buyer" ? "buyerId" : "sellerId";
  const snapshot = await db.collection(COLLECTIONS.ORDERS)
    .where(field, "==", userId)
    .get();
    
  // Sort in JavaScript to avoid composite index requirement
  const orders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  orders.sort((a: any, b: any) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
  
  return orders;
}

export async function findOrderById(id: string) {
  if (!db) return null;
  const doc = await db.collection(COLLECTIONS.ORDERS).doc(id).get();
  return doc.exists ? { id: doc.id, ...doc.data() } : null;
}

export async function createOrder(data: {
  buyerId: string;
  sellerId: string;
  serviceId: string;
  serviceTitle: string; // Denormalized
  serviceSlug: string;  // Denormalized
  buyerName: string;   // Denormalized
  extras?: { name: string; price: number }[];
  totalAmount: string;
  requirements?: string;
  deliveryDate?: any;
}) {
  if (!db) throw new Error("Database not initialized");
  
  const orderNumber = generateOrderNumber();
  const orderId = nanoid(10); // Custom ID for order or let Firestore generate
  
  return await db.runTransaction(async (transaction) => {
    // 1. Check buyer balance
    const walletRef = db!.collection(COLLECTIONS.WALLETS).doc(data.buyerId);
    const walletDoc = await transaction.get(walletRef);
    
    if (!walletDoc.exists) {
      throw new Error("لم يتم العثور على محفظة لهذا المستخدم.");
    }
    
    const wallet = walletDoc.data();
    const balance = parseFloat(wallet?.balance ?? "0");
    const total = parseFloat(data.totalAmount);

    if (balance < total) {
      throw new Error("رصيدك غير كافٍ لإتمام هذا الطلب. يرجى شحن محفظتك أولاً.");
    }

    // 2. Deduct balance
    const newBalance = (balance - total).toFixed(2);
    transaction.update(walletRef, { balance: newBalance });

    // 3. Create order
    const orderRef = db!.collection(COLLECTIONS.ORDERS).doc(orderId);
    const newOrder = {
      ...data,
      orderNumber,
      escrowAmount: data.totalAmount,
      sellerEarnings: data.totalAmount,
      status: "pending",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    transaction.set(orderRef, newOrder);

    // 4. Log transaction
    const txRef = walletRef.collection("transactions").doc();
    transaction.set(txRef, {
      type: "payment",
      amount: String(-total),
      balanceAfter: newBalance,
      referenceType: "order",
      referenceId: orderId,
      description: `حجز مبلغ طلب: ${orderNumber}`,
      status: "completed",
      createdAt: new Date().toISOString(),
    });

    return { id: orderId, orderNumber };
  });
}

export async function updateOrderStatus(
  id: string,
  _userId: string,
  status: string,
  note?: string,
) {
  if (!db) return;
  
  return await db.runTransaction(async (transaction) => {
    const orderRef = db!.collection(COLLECTIONS.ORDERS).doc(id);
    const orderDoc = await transaction.get(orderRef);
    
    if (!orderDoc.exists) throw new Error("الطلب غير موجود");
    const order = orderDoc.data();

    if (order?.status === "completed") return;

    const now = new Date().toISOString();
    const orderUpdate: Record<string, any> = { status, updatedAt: now };

    if (status === "delivered") {
      orderUpdate.deliveredAt = now;
      if (note) orderUpdate.deliveryNote = note;
    }

    if (status === "revision") {
      orderUpdate.revisionRequestedAt = now;
      if (note) orderUpdate.revisionNote = note;
    }

    transaction.update(orderRef, orderUpdate);

    if (status === "completed" && order) {
      const sellerWalletRef = db!.collection(COLLECTIONS.WALLETS).doc(order.sellerId);
      const sellerWalletDoc = await transaction.get(sellerWalletRef);
      
      let sellerBalance = 0;
      if (sellerWalletDoc.exists) {
        sellerBalance = parseFloat(sellerWalletDoc.data()?.balance ?? "0");
      }
      
      const amountToAdd = parseFloat(order.totalAmount);
      const newBalance = (sellerBalance + amountToAdd).toFixed(2);

      transaction.set(sellerWalletRef, { balance: newBalance }, { merge: true });
      transaction.update(orderRef, { releasedAt: now, completedAt: now });

      const txRef = sellerWalletRef.collection("transactions").doc();
      transaction.set(txRef, {
        type: "escrow_release",
        amount: order.totalAmount,
        balanceAfter: newBalance,
        referenceType: "order",
        referenceId: id,
        description: `أرباح الطلب: ${order.orderNumber}`,
        status: "completed",
        createdAt: now,
      });
    }

    if (status === "cancelled" && order) {
      const buyerWalletRef = db!.collection(COLLECTIONS.WALLETS).doc(order.buyerId);
      const buyerWalletDoc = await transaction.get(buyerWalletRef);
      const buyerBalance = parseFloat(buyerWalletDoc.data()?.balance ?? "0");
      const refundAmount = parseFloat(order.escrowAmount ?? order.totalAmount);
      const newBalance = (buyerBalance + refundAmount).toFixed(2);

      transaction.set(buyerWalletRef, { balance: newBalance }, { merge: true });
      transaction.update(orderRef, { cancelledAt: now });

      const txRef = buyerWalletRef.collection("transactions").doc();
      transaction.set(txRef, {
        type: "refund",
        amount: String(refundAmount),
        balanceAfter: newBalance,
        referenceType: "order",
        referenceId: id,
        description: `استرداد طلب: ${order.orderNumber}`,
        status: "completed",
        createdAt: now,
      });
    }
  });

  // Send notifications after transaction completes
  const orderAfter = await db.collection(COLLECTIONS.ORDERS).doc(id).get();
  const orderData = orderAfter.data();
  
  if (orderData) {
    const statusMessages: Record<string, { buyer: string; seller: string }> = {
      in_progress: {
        buyer: "بدأ البائع العمل على طلبك",
        seller: "بدأ العمل على الطلب",
      },
      delivered: {
        buyer: "تم تسليم الطلب! يرجى المراجعة والقبول",
        seller: "تم تسليم الطلب بنجاح",
      },
      revision: {
        buyer: "طلب تعديل على التسليم",
        seller: "طلب المشتري تعديل على التسليم",
      },
      completed: {
        buyer: "تم قبول الطلب وتحرير الأرباح",
        seller: "تم قبول الطلب! الأرباح أُضيفت لمحفظتك",
      },
      cancelled: {
        buyer: "تم إلغاء الطلب واسترداد المبلغ",
        seller: "تم إلغاء الطلب",
      },
    };

    const messages = statusMessages[status];
    if (messages) {
      // Notify buyer
      await createNotification(orderData.buyerId, {
        title: `تحديث الطلب: ${orderData.orderNumber}`,
        message: messages.buyer,
        type: "order",
        referenceId: id,
        referenceType: "order",
      });

      // Notify seller
      await createNotification(orderData.sellerId, {
        title: `تحديث الطلب: ${orderData.orderNumber}`,
        message: messages.seller,
        type: "order",
        referenceId: id,
        referenceType: "order",
      });
    }
  }
}

export async function adminListOrders(limit = 50) {
  if (!db) return [];
  const snapshot = await db.collection(COLLECTIONS.ORDERS)
    .orderBy("createdAt", "desc")
    .limit(limit)
    .get();
    
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export async function countOrders() {
  if (!db) return 0;
  const snapshot = await db.collection(COLLECTIONS.ORDERS).count().get();
  return snapshot.data().count;
}
