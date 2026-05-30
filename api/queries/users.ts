import { eq } from "drizzle-orm";
import * as schema from "../../db/schema";
import type { InsertUser } from "../../db/schema";
import { getDb } from "./connection";
import { env } from "../lib/env";

export async function findUserByUnionId(unionId: string) {
  const rows = await getDb()
    .select()
    .from(schema.users)
    .where(eq(schema.users.unionId, unionId))
    .limit(1);
  return rows.at(0);
}

export async function upsertUser(data: InsertUser, forceAdmin = false) {
  const values = { ...data };
  
  // On update (re-login): update profile info but NEVER overwrite the existing role
  // This prevents sellers from being demoted to buyers on re-login
  const updateSet: Partial<InsertUser> = {
    lastSignInAt: new Date(),
    name: data.name,
    email: data.email,
    avatar: data.avatar,
    // role is intentionally excluded from updateSet
  };

  // Force admin role for owner on both insert and update
  if (forceAdmin || (values.unionId && values.unionId === env.ownerUnionId)) {
    values.role = "admin";
    updateSet.role = "admin";
  }

  console.log("[Users] Upserting user:", data.unionId);
  await getDb()
    .insert(schema.users)
    .values(values)
    .onDuplicateKeyUpdate({ set: updateSet });
    
  console.log("[Users] Upsert insertion done. Fetching user...");
  return findUserByUnionId(data.unionId);
}

