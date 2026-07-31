import {
  addDoc,
  collection,
  getDocs,
  query,
  where,
  updateDoc,
  doc,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";

import { db } from "../firebase/config";

const COLLECTION_NAME = "notifications";

/**
 * Create notification
 */
export async function createNotification(userId, title, message) {
  try {
    const docRef = await addDoc(collection(db, COLLECTION_NAME), {
      userId,
      title,
      message,
      read: false,
      createdAt: serverTimestamp(),
    });

    return docRef.id;
  } catch (error) {
    throw error;
  }
}

/**
 * Get notifications for one user
 */
export async function getNotifications(userId) {
  try {
    const q = query(
      collection(db, COLLECTION_NAME),
      where("userId", "==", userId),
      orderBy("createdAt", "desc")
    );

    const snapshot = await getDocs(q);

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    throw error;
  }
}

/**
 * Mark notification as read
 */
export async function markAsRead(notificationId) {
  try {
    await updateDoc(doc(db, COLLECTION_NAME, notificationId), {
      read: true,
    });
  } catch (error) {
    throw error;
  }
}