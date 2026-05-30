/**
 * Script to sync all Firebase Auth users into the MySQL database.
 * Run this once to import existing Firebase users who haven't been synced yet.
 * Usage: npx tsx db/sync-firebase-users.ts
 */

import admin from "firebase-admin";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

// Initialize Firebase Admin
const projectId = process.env.FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

if (!projectId || !clientEmail || !privateKey) {
  console.error("❌ Missing Firebase env vars. Check your .env.local file.");
  process.exit(1);
}

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({ projectId, clientEmail, privateKey }),
  });
}

import { getDb } from "../api/queries/connection";
import * as schema from "./schema";

const ADMIN_EMAIL = "omar.rawas17@gmail.com";

async function syncFirebaseUsers() {
  const db = getDb();
  console.log("🔄 Fetching users from Firebase Auth...\n");

  let allFirebaseUsers: admin.auth.UserRecord[] = [];
  let nextPageToken: string | undefined;

  // Paginate through all Firebase users
  do {
    const result = await admin.auth().listUsers(1000, nextPageToken);
    allFirebaseUsers.push(...result.users);
    nextPageToken = result.pageToken;
  } while (nextPageToken);

  console.log(`📋 Found ${allFirebaseUsers.length} Firebase users\n`);

  let synced = 0;
  let skipped = 0;

  for (const fbUser of allFirebaseUsers) {
    const isAdmin = fbUser.email === ADMIN_EMAIL;
    const role = isAdmin ? "admin" : "buyer";

    try {
      await db
        .insert(schema.users)
        .values({
          unionId: fbUser.uid,
          name: fbUser.displayName || fbUser.email?.split("@")[0] || "User",
          email: fbUser.email || null,
          avatar: fbUser.photoURL || null,
          role,
          status: fbUser.disabled ? "suspended" : "active",
          lastSignInAt: fbUser.metadata.lastSignInTime
            ? new Date(fbUser.metadata.lastSignInTime)
            : new Date(),
        })
        .onDuplicateKeyUpdate({
          set: {
            // Update profile info but preserve existing role
            name: fbUser.displayName || fbUser.email?.split("@")[0] || "User",
            email: fbUser.email || null,
            avatar: fbUser.photoURL || null,
            lastSignInAt: fbUser.metadata.lastSignInTime
              ? new Date(fbUser.metadata.lastSignInTime)
              : new Date(),
            // Force admin role for admin email
            ...(isAdmin ? { role: "admin" as const } : {}),
          },
        });

      const action = isAdmin ? "👑 ADMIN" : "👤 user";
      console.log(`  ✓ [${action}] ${fbUser.displayName || fbUser.email} (${fbUser.uid})`);
      synced++;
    } catch (err: any) {
      console.error(`  ✗ Failed for ${fbUser.email}: ${err.message}`);
      skipped++;
    }
  }

  // Ensure wallets exist for all synced users
  console.log("\n💰 Ensuring wallets for all users...");
  const allDbUsers = await db.select({ id: schema.users.id }).from(schema.users);
  for (const u of allDbUsers) {
    await db
      .insert(schema.wallets)
      .values({ userId: u.id, balance: "0" })
      .onDuplicateKeyUpdate({ set: { userId: u.id } });
  }

  console.log(`\n✅ Sync complete!`);
  console.log(`   Synced: ${synced} users`);
  console.log(`   Errors: ${skipped} users`);
  process.exit(0);
}

syncFirebaseUsers().catch(err => {
  console.error("❌ Fatal error:", err.message);
  process.exit(1);
});
