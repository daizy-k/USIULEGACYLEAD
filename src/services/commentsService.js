import {
  addDoc,
  collection,
  getDocs,
  query,
  where,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";

import { db } from "../firebase/config";

const COLLECTION_NAME = "comments";

/**
 * Add a comment to a handover packet
 */
export async function addComment(packetId, userId, comment) {
  try {
    const docRef = await addDoc(collection(db, COLLECTION_NAME), {
      packetId,
      userId,
      comment,
      createdAt: serverTimestamp(),
    });

    return docRef.id;
  } catch (error) {
    throw error;
  }
}

/**
 * Get comments for a packet
 */
export async function getComments(packetId) {
  try {
    const q = query(
      collection(db, COLLECTION_NAME),
      where("packetId", "==", packetId),
      orderBy("createdAt", "asc")
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