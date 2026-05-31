import { db, auth } from "../lib/firebase-admin";
import { env } from "../lib/env";
import { COLLECTIONS } from "../lib/firestore-utils";

export async function findUserByUnionId(unionId: string) {
  if (!db) return null;
  const doc = await db.collection(COLLECTIONS.USERS).doc(unionId).get();
  return doc.exists ? { id: doc.id, ...doc.data() } : null;
}

export async function upsertUser(data: any, forceAdmin = false) {
  if (!db) return null;
  
  const unionId = data.unionId;
  if (!unionId) throw new Error("unionId is required for upsertUser");

  const userRef = db.collection(COLLECTIONS.USERS).doc(unionId);
  const existingDoc = await userRef.get();
  
  const values = { ...data };
  const now = new Date().toISOString();
  
  if (!existingDoc.exists) {
    // New user
    values.createdAt = now;
    values.updatedAt = now;
    values.lastSignInAt = now;
    values.status = values.status || "active";
    values.role = values.role || "buyer";
    
    // Force admin for owner
    if (forceAdmin || unionId === env.ownerUnionId) {
      values.role = "admin";
    }
    
    await userRef.set(values);
  } else {
    // Update existing user
    const existingData = existingDoc.data();
    const updateSet: any = {
      lastSignInAt: now,
      updatedAt: now,
      name: data.name || existingData?.name,
      email: data.email || existingData?.email,
      avatar: data.avatar || existingData?.avatar,
    };
    
    // Always ensure owner is admin
    if (forceAdmin || unionId === env.ownerUnionId) {
      updateSet.role = "admin";
    }

    await userRef.update(updateSet);
  }

  try {
    const finalDoc = await userRef.get();
    return { id: finalDoc.id, ...finalDoc.data() };
  } catch (err: any) {
    return null;
  }
}

export async function updateUserProfile(unionId: string, data: {
  name?: string;
  phone?: string;
  avatar?: string;
}) {
  if (!db) throw new Error("Database not initialized");
  
  const userRef = db.collection(COLLECTIONS.USERS).doc(unionId);
  const doc = await userRef.get();
  
  if (!doc.exists) throw new Error("المستخدم غير موجود");
  
  const updateData: Record<string, any> = {
    updatedAt: new Date().toISOString(),
  };
  
  if (data.name !== undefined) updateData.name = data.name;
  if (data.phone !== undefined) updateData.phone = data.phone;
  if (data.avatar !== undefined) updateData.avatar = data.avatar;
  
  await userRef.update(updateData);
  
  // Also update Firebase Auth display name and photo URL if changed
  if (auth && (data.name !== undefined || data.avatar !== undefined)) {
    const firebaseUpdate: Record<string, string> = {};
    if (data.name !== undefined) firebaseUpdate.displayName = data.name;
    if (data.avatar !== undefined) firebaseUpdate.photoURL = data.avatar;
    
    try {
      await auth.updateUser(unionId, firebaseUpdate);
    } catch (err: any) {
      // silently ignore
    }
  }
  
  const finalDoc = await userRef.get();
  return { id: finalDoc.id, ...finalDoc.data() };
}

export async function changeUserPassword(unionId: string, newPassword: string) {
  if (!auth) throw new Error("Firebase Auth not initialized");
  
  try {
    await auth.updateUser(unionId, {
      password: newPassword,
    });
    return { success: true };
  } catch (err: any) {
    throw new Error("فشل في تغيير كلمة المرور. يرجى المحاولة مرة أخرى.");
  }
}

export async function getUserSettings(unionId: string) {
  if (!db) return null;
  
  const userRef = db.collection(COLLECTIONS.USERS).doc(unionId);
  const doc = await userRef.get();
  
  if (!doc.exists) return null;
  
  const data = doc.data();
  return {
    notifications: data?.settings?.notifications ?? {
      orderUpdates: true,
      messages: true,
      payments: true,
      promotions: false,
    },
    privacy: data?.settings?.privacy ?? {
      showEmail: false,
      showPhone: false,
      showProfile: true,
    },
  };
}

export async function updateUserSettings(unionId: string, settings: {
  notifications?: {
    orderUpdates?: boolean;
    messages?: boolean;
    payments?: boolean;
    promotions?: boolean;
  };
  privacy?: {
    showEmail?: boolean;
    showPhone?: boolean;
    showProfile?: boolean;
  };
}) {
  if (!db) throw new Error("Database not initialized");
  
  const userRef = db.collection(COLLECTIONS.USERS).doc(unionId);
  const doc = await userRef.get();
  
  if (!doc.exists) throw new Error("المستخدم غير موجود");
  
  const currentSettings = doc.data()?.settings || {};
  
  const updatedSettings = {
    ...currentSettings,
    ...(settings.notifications && { notifications: { ...currentSettings.notifications, ...settings.notifications } }),
    ...(settings.privacy && { privacy: { ...currentSettings.privacy, ...settings.privacy } }),
  };
  
  await userRef.update({
    settings: updatedSettings,
    updatedAt: new Date().toISOString(),
  });
  
  return updatedSettings;
}

export async function deleteUserAccount(unionId: string) {
  if (!db) throw new Error("Database not initialized");
  if (!auth) throw new Error("Firebase Auth not initialized");
  
  // Delete user data from Firestore
  const userRef = db.collection(COLLECTIONS.USERS).doc(unionId);
  const doc = await userRef.get();
  
  if (!doc.exists) throw new Error("المستخدم غير موجود");
  
  // Delete user document
  await userRef.delete();
  
  // Delete Firebase Auth user
  try {
    await auth.deleteUser(unionId);
  } catch (err: any) {
    // silently ignore
  }
  
  return { success: true };
}

