import { auth as adminAuth } from "./firebase-admin";

export interface AuthedUser {
  id?: string;
  unionId: string;
  name?: string;
  email?: string;
  avatar?: string;
  role: "buyer" | "seller" | "admin" | "moderator";
}

const ADMIN_EMAILS = [
  "omar.rawas17@gmail.com",
];

export async function authenticateRequest(req: Request): Promise<AuthedUser | null> {
  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return null;
  }

  const idToken = authHeader.split("Bearer ")[1];

  try {
    if (!adminAuth) {
      return null;
    }

    const decodedToken = await adminAuth.verifyIdToken(idToken);
    const email = decodedToken.email;
    const isAdmin = email && ADMIN_EMAILS.includes(email);

    // Sync with DB to get/create numeric ID
    const { upsertUser } = await import("../queries/users");
    const dbUser = await upsertUser({
      unionId: decodedToken.uid,
      email: email,
      name: decodedToken.name || email?.split("@")[0] || "User",
      avatar: decodedToken.picture,
      // Only set role=admin for admin emails on insert; don't overwrite seller roles
      role: isAdmin ? "admin" : "buyer",
    }, !!isAdmin);

    if (!dbUser) {
       return null;
    }

    return {
      id: (dbUser as any).id as any, // Numeric ID from DB
      unionId: (dbUser as any).unionId,
      email: (dbUser as any).email ?? undefined,
      name: (dbUser as any).name ?? undefined,
      avatar: (dbUser as any).avatar ?? undefined,
      role: (dbUser as any).role as any,
    };

  } catch (error: any) {
    return null;
  }
}
