import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
} from "firebase/firestore";

import { db } from "../firebase/config";

// Create a user profile
export async function createProfile(uid, profileData) {
  try {
    await setDoc(doc(db, "users", uid), profileData);
  } catch (error) {
    throw error;
  }
}

// Get a user's profile
export async function getProfile(uid) {
  try {
    const profileRef = doc(db, "users", uid);
    const profileSnap = await getDoc(profileRef);

    if (!profileSnap.exists()) {
      return null;
    }

    return profileSnap.data();
  } catch (error) {
    throw error;
  }
}

// Update profile
export async function updateProfile(uid, updates) {
  try {
    const profileRef = doc(db, "users", uid);

    await updateDoc(profileRef, updates);
  } catch (error) {
    throw error;
  }
}