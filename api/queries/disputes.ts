import { db } from "../lib/firebase-admin";
import { COLLECTIONS } from "../lib/firestore-utils";
import { createNotification } from "./notifications";

export async function createDispute(data: {
  orderId: string;
  openedBy: string;
  openedByName: string;
  reason: string;
  description: string;
  evidence?: string[];
}) {
  if (!db) throw new Error("Database not initialized");

  const orderRef = db.collection(COLLECTIONS.ORDERS).doc(data.orderId);
  const orderDoc = await orderRef.get();
  if (!orderDoc.exists) throw new Error("الطلب غير موجود");
  const order = orderDoc.data()!;

  const disputeRef = db.collection(COLLECTIONS.DISPUTES).doc();
  const disputeId = disputeRef.id;

  const dispute = {
    orderId: data.orderId,
    orderNumber: order.orderNumber,
    serviceTitle: order.serviceTitle,
    buyerId: order.buyerId,
    buyerName: order.buyerName || "مشتري",
    sellerId: order.sellerId,
    sellerName: order.sellerName || "بائع",
    openedBy: data.openedBy,
    openedByName: data.openedByName,
    reason: data.reason,
    description: data.description,
    evidence: data.evidence || [],
    status: "open",
    escrowAmount: order.escrowAmount || order.totalAmount,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  await disputeRef.set(dispute);

  await orderRef.update({ hasDispute: true, disputeId });

  const notifyUserId = data.openedBy === order.buyerId ? order.sellerId : order.buyerId;
  const notifyUserName = data.openedBy === order.buyerId ? order.sellerId : order.buyerName;
  await createNotification(notifyUserId, {
    title: "تم فتح نزاع",
    message: `تم فتح نزاع على الطلب ${order.orderNumber} من قبل ${data.openedByName}`,
    type: "dispute",
    referenceId: disputeId,
    referenceType: "dispute",
  });

  await createNotification(order.sellerId, {
    title: "تم فتح نزاع",
    message: `تم فتح نزاع على الطلب ${order.orderNumber} - السبب: ${data.reason}`,
    type: "dispute",
    referenceId: disputeId,
    referenceType: "dispute",
  });

  return { id: disputeId };
}

export async function listDisputes(status?: string) {
  if (!db) return [];
  let query: any = db.collection(COLLECTIONS.DISPUTES);
  if (status && status !== "all") {
    query = query.where("status", "==", status);
  }
  const snapshot = await query.orderBy("createdAt", "desc").get();
  return snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));
}

export async function getDisputeById(id: string) {
  if (!db) return null;
  const doc = await db.collection(COLLECTIONS.DISPUTES).doc(id).get();
  return doc.exists ? { id: doc.id, ...doc.data() } : null;
}

export async function listDisputesByUser(userId: string) {
  if (!db) return [];
  const snapshot = await db.collection(COLLECTIONS.DISPUTES)
    .where("openedBy", "==", userId)
    .orderBy("createdAt", "desc")
    .get();
  return snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));
}

export async function resolveDispute(
  id: string,
  decision: "buyer_favor" | "seller_favor" | "cancelled",
  adminNote?: string,
) {
  if (!db) throw new Error("Database not initialized");

  await db.runTransaction(async (transaction) => {
    const disputeRef = db!.collection(COLLECTIONS.DISPUTES).doc(id);
    const disputeDoc = await transaction.get(disputeRef);

    if (!disputeDoc.exists) throw new Error("النزاع غير موجود");
    const dispute = disputeDoc.data()!;

    if (dispute.status !== "open") throw new Error("تم حل هذا النزاع مسبقاً");

    const now = new Date().toISOString();

    if (decision === "buyer_favor") {
      const buyerWalletRef = db!.collection(COLLECTIONS.WALLETS).doc(dispute.buyerId);
      const buyerWalletDoc = await transaction.get(buyerWalletRef);
      const currentBalance = parseFloat(buyerWalletDoc.data()?.balance ?? "0");
      const refundAmount = parseFloat(dispute.escrowAmount ?? "0");
      const newBalance = (currentBalance + refundAmount).toFixed(2);

      transaction.set(buyerWalletRef, { balance: newBalance }, { merge: true });

      const txRef = buyerWalletRef.collection("transactions").doc();
      transaction.set(txRef, {
        type: "refund",
        amount: String(refundAmount),
        balanceAfter: newBalance,
        referenceType: "dispute",
        referenceId: id,
        description: `استرداد بسبب نزاع: ${dispute.orderNumber}`,
        status: "completed",
        createdAt: now,
      });
    }

    if (decision === "seller_favor") {
      const sellerWalletRef = db!.collection(COLLECTIONS.WALLETS).doc(dispute.sellerId);
      const sellerWalletDoc = await transaction.get(sellerWalletRef);
      let sellerBalance = 0;
      if (sellerWalletDoc.exists) {
        sellerBalance = parseFloat(sellerWalletDoc.data()?.balance ?? "0");
      }
      const amount = parseFloat(dispute.escrowAmount ?? "0");
      const newBalance = (sellerBalance + amount).toFixed(2);

      transaction.set(sellerWalletRef, { balance: newBalance }, { merge: true });

      const txRef = sellerWalletRef.collection("transactions").doc();
      transaction.set(txRef, {
        type: "escrow_release",
        amount: String(amount),
        balanceAfter: newBalance,
        referenceType: "dispute",
        referenceId: id,
        description: `أرباح بسبب نزاع: ${dispute.orderNumber}`,
        status: "completed",
        createdAt: now,
      });
    }

    const orderRef = db!.collection(COLLECTIONS.ORDERS).doc(dispute.orderId);
    transaction.update(orderRef, {
      status: decision === "buyer_favor" ? "cancelled" : "completed",
      hasDispute: false,
      resolvedAt: now,
    });

    transaction.update(disputeRef, {
      status: "resolved",
      decision,
      adminNote: adminNote || "",
      resolvedAt: now,
      updatedAt: now,
    });
  });

  const disputeAfter = await db.collection(COLLECTIONS.DISPUTES).doc(id).get();
  const disputeData = disputeAfter.data();

  if (disputeData) {
    const decisionLabels: Record<string, string> = {
      buyer_favor: "تم الحل لصالح المشتري (استرداد)",
      seller_favor: "تم الحل لصالح البائع (صرف الأرباح)",
      cancelled: "تم إلغاء النزاع",
    };

    await createNotification(disputeData.buyerId, {
      title: "تم حل النزاع",
      message: `${decisionLabels[decision]} - الطلب: ${disputeData.orderNumber}`,
      type: "dispute",
      referenceId: id,
      referenceType: "dispute",
    });

    await createNotification(disputeData.sellerId, {
      title: "تم حل النزاع",
      message: `${decisionLabels[decision]} - الطلب: ${disputeData.orderNumber}`,
      type: "dispute",
      referenceId: id,
      referenceType: "dispute",
    });
  }
}

export async function countOpenDisputes(): Promise<number> {
  if (!db) return 0;
  const snapshot = await db.collection(COLLECTIONS.DISPUTES)
    .where("status", "==", "open")
    .count()
    .get();
  return snapshot.data().count;
}
