import admin from "firebase-admin";
import { env } from "./env";

function getFirebaseApp() {
  try {
    if (!env.firebase.projectId || !env.firebase.clientEmail || !env.firebase.privateKey) {
      return null;
    }
    
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
    return null;
  }
}


const app = getFirebaseApp();

export const auth = app ? app.auth() : null;
export const db = app ? app.firestore() : null;

