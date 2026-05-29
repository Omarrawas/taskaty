import { getAuth } from "firebase-admin/auth";
import { auth as adminAuth } from "./firebase-admin";
import { findUserByUnionId, upsertUser } from "../queries/users";

export interface AuthedUser {
  unionId: string;
  name?: string;
  email?: string;
  avatar?: string;
  role: "buyer" | "seller" | "admin" | "moderator";
}

export async function authenticateRequest(req: Request): Promise<AuthedUser | null> {
  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return null;
  }

  const idToken = authHeader.split("Bearer ")[1];
  
  try {
    if (!adminAuth) {
      console.error("[Auth] Firebase Admin not initialized");
      return null;
    }

    const decodedToken = await adminAuth.verifyIdToken(idToken);
    
    // We have a valid Firebase user. Now try to get/sync they in our DB.
    let user: any = null;
    try {
      console.log("[Auth] Attempting to find/upsert user in DB:", decodedToken.uid);
      user = await upsertUser({
        unionId: decodedToken.uid,
        email: decodedToken.email,
        name: decodedToken.name || decodedToken.email?.split("@")[0] || "User",
        avatar: decodedToken.picture,
        lastSignInAt: new Date(),
      });
    } catch (dbError: any) {
      console.error("[Auth] Database failure, but continuing with Firebase identity:", dbError.message);
      // FAIL-SAFE: If DB crashes, we still allow the request but with limited info
      return {
        unionId: decodedToken.uid,
        email: decodedToken.email,
        name: decodedToken.name || "User (Guest Mode)",
        role: "buyer", // Default for guest
      };
    }

    return user;
  } catch (error: any) {
    console.error("[Auth] Token verification failed:", error.message);
    return null;
  }
}
