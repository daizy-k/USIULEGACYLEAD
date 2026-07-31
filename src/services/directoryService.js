import {
  addDoc,
  collection,
  getDocs,
  getDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  serverTimestamp,
} from "firebase/firestore";

import { db } from "../firebase/config";

const COLLECTION_NAME = "vendors";

/**
 * Add a new vendor/company
 */
export async function addVendor(vendorData) {
  try {
    const docRef = await addDoc(collection(db, COLLECTION_NAME), {
      ...vendorData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return docRef.id;
  } catch (error) {
    throw error;
  }
}

/**
 * Get a vendor by ID
 */
export async function getVendor(vendorId) {
  try {
    const snapshot = await getDoc(doc(db, COLLECTION_NAME, vendorId));

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

/**
 * Get all vendors for one club
 */
export async function getClubVendors(clubId) {
  try {
    const q = query(
      collection(db, COLLECTION_NAME),
      where("clubId", "==", clubId)
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
 * Update vendor details
 */
export async function updateVendor(vendorId, updates) {
  try {
    await updateDoc(doc(db, COLLECTION_NAME, vendorId), {
      ...updates,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    throw error;
  }
}

/**
 * Delete a vendor
 */
export async function deleteVendor(vendorId) {
  try {
    await deleteDoc(doc(db, COLLECTION_NAME, vendorId));
  } catch (error) {
    throw error;
  }
}