import {
  collection,
  getDocs,
  doc,
  getDoc,
} from "firebase/firestore";

import { db } from "../firebase/config";

const COLLECTION_NAME = "organizations";

/**
 * Get all organizations
 */
export async function getOrganizations() {
  try {
    const snapshot = await getDocs(collection(db, COLLECTION_NAME));

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    throw error;
  }
}

/**
 * Get one organization
 */
export async function getOrganization(id) {
  try {
    const snapshot = await getDoc(doc(db, COLLECTION_NAME, id));

    if (!snapshot.exists()) {
      return null;
    }

    return {
      id: snapshot.id,
      ...snapshot.data(),
    };
  } catch (error) {
    throw error;
  }
}