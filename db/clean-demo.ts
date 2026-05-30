import { getDb } from "../api/queries/connection";
import * as schema from "./schema";
import { inArray } from "drizzle-orm";

async function cleanDemoUsers() {
  const db = getDb();
  console.log("🔍 Finding demo users...");

  // Find demo users by their unionId
  const demoUnionIds = ["demo_user_1", "demo_user_2"];

  const demoUsers = await db
    .select({ id: schema.users.id, name: schema.users.name, email: schema.users.email })
    .from(schema.users)
    .where(inArray(schema.users.unionId, demoUnionIds));

  if (demoUsers.length === 0) {
    console.log("✅ No demo users found - already clean!");
    process.exit(0);
  }

  console.log(`🗑️  Found ${demoUsers.length} demo users:`, demoUsers.map(u => u.name));

  const demoIds = demoUsers.map(u => u.id);

  // Delete in correct order (foreign key constraints)
  console.log("🧹 Deleting related data...");

  // Delete wallets
  await db.delete(schema.wallets).where(inArray(schema.wallets.userId, demoIds));
  console.log("   ✓ Wallets deleted");

  // Delete seller profiles
  await db.delete(schema.sellerProfiles).where(inArray(schema.sellerProfiles.userId, demoIds));
  console.log("   ✓ Seller profiles deleted");

  // Delete services (and their related data)
  const demoServices = await db
    .select({ id: schema.services.id })
    .from(schema.services)
    .where(inArray(schema.services.sellerId, demoIds));

  if (demoServices.length > 0) {
    const serviceIds = demoServices.map(s => s.id);
    await db.delete(schema.services).where(inArray(schema.services.id, serviceIds));
    console.log(`   ✓ ${demoServices.length} services deleted`);
  }

  // Delete users
  await db.delete(schema.users).where(inArray(schema.users.id, demoIds));
  console.log("   ✓ Demo users deleted");

  console.log("\n✅ Done! Demo users removed successfully.");
  process.exit(0);
}

cleanDemoUsers().catch(err => {
  console.error("❌ Failed:", err.message);
  process.exit(1);
});
