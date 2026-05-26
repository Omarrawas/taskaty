import admin from "firebase-admin";
import { env } from "./env";

function getFirebaseApp() {
  try {
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: env.firebase.projectId,
          clientEmail: env.firebase.clientEmail,
          privateKey: env.firebase.privateKey,
        }),
      });
    }
    return admin;
  } catch (error) {
    console.error("[Firebase Admin] Initialization failed:", error);
    console.error("[Firebase Admin] Ensure FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY are set.");
    return null;
  }
}

const app = getFirebaseApp();

export const auth = app?.auth() ?? null;
export const db = app?.firestore() ?? null;
