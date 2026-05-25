import { eq, and, desc, or } from "drizzle-orm";
import { getDb } from "./connection";
import * as schema from "../../db/schema";

export async function listConversations(userId: number) {
  const db = getDb();
  return db
    .select({
      id: schema.conversations.id,
      orderId: schema.conversations.orderId,
      buyerId: schema.conversations.buyerId,
      sellerId: schema.conversations.sellerId,
      lastMessage: schema.conversations.lastMessage,
      lastMessageAt: schema.conversations.lastMessageAt,
      createdAt: schema.conversations.createdAt,
      otherName: schema.users.name,
      otherAvatar: schema.users.avatar,
    })
    .from(schema.conversations)
    .innerJoin(
      schema.users,
      or(
        and(
          eq(schema.conversations.buyerId, userId),
          eq(schema.users.id, schema.conversations.sellerId),
        ),
        and(
          eq(schema.conversations.sellerId, userId),
          eq(schema.users.id, schema.conversations.buyerId),
        ),
      ),
    )
    .where(
      or(
        eq(schema.conversations.buyerId, userId),
        eq(schema.conversations.sellerId, userId),
      ),
    )
    .orderBy(desc(schema.conversations.lastMessageAt));
}

export async function findOrCreateConversation(participantA: number, participantB: number) {
  const db = getDb();
  const [buyerId, sellerId] = participantA < participantB ? [participantA, participantB] : [participantB, participantA];

  const existing = await db
    .select()
    .from(schema.conversations)
    .where(
      and(
        eq(schema.conversations.buyerId, buyerId),
        eq(schema.conversations.sellerId, sellerId),
      ),
    )
    .limit(1);

  if (existing.length > 0) return existing[0];

  const [result] = await db.insert(schema.conversations).values({
    buyerId,
    sellerId,
  });
  
  const created = await db
    .select()
    .from(schema.conversations)
    .where(eq(schema.conversations.id, result.insertId))
    .limit(1);
    
  return created[0];
}

export async function listMessages(conversationId: number, limit = 50) {
  return getDb()
    .select({
      id: schema.messages.id,
      content: schema.messages.content,
      isRead: schema.messages.isRead,
      createdAt: schema.messages.createdAt,
      senderId: schema.messages.senderId,
      senderName: schema.users.name,
      senderAvatar: schema.users.avatar,
    })
    .from(schema.messages)
    .innerJoin(schema.users, eq(schema.users.id, schema.messages.senderId))
    .where(eq(schema.messages.conversationId, conversationId))
    .orderBy(desc(schema.messages.createdAt))
    .limit(limit);
}

export async function createMessage(data: {
  conversationId: number;
  senderId: number;
  content: string;
}) {
  const db = getDb();
  await db.insert(schema.messages).values(data);
  await db
    .update(schema.conversations)
    .set({
      lastMessage: data.content.substring(0, 100),
      lastMessageAt: new Date(),
    })
    .where(eq(schema.conversations.id, data.conversationId));
}
