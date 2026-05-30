import { getDb } from "../api/queries/connection";
import * as schema from "./schema";

async function listAllUsers() {
  const db = getDb();
  console.log("🔍 Fetching ALL users from DB...\n");

  const users = await db
    .select({
      id: schema.users.id,
      unionId: schema.users.unionId,
      name: schema.users.name,
      email: schema.users.email,
      role: schema.users.role,
      status: schema.users.status,
      createdAt: schema.users.createdAt,
    })
    .from(schema.users)
    .orderBy(schema.users.id);

  console.log(`Total users: ${users.length}`);
  users.forEach(u => {
    console.log(`  [${u.id}] ${u.name} | ${u.email} | role=${u.role} | uid=${u.unionId}`);
  });

  process.exit(0);
}

listAllUsers().catch(err => {
  console.error("❌ Error:", err.message);
  process.exit(1);
});
