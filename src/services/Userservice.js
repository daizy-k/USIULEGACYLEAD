// Handles reading/writing user profile documents in Firestore.
// Collection shape: users/{uid}
// {
//   name, email,
//   orgId, orgName,
//   role: "outgoing" | "incoming" | "admin",
//   createdAt
// }
//
// Personal notes live in their own subcollection now — see notesService.js.

import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase/config";

const USERS_COLLECTION = "users";

export async function createUserProfile(uid, { name, email, orgId, orgName, role }) {
  await setDoc(doc(db, USERS_COLLECTION, uid), {
    name,
    email,
    orgId,
    orgName,
    role,
    createdAt: serverTimestamp(),
  });
}

export async function getUserProfile(uid) {
  const snapshot = await getDoc(doc(db, USERS_COLLECTION, uid));
  if (!snapshot.exists()) return null;
  return { id: snapshot.id, ...snapshot.data() };
}