// Handles reading/writing user profile documents in Firestore.
// Collection shape: users/{uid}
// {
//   name, email,
//   orgId, orgName,
//   role: "outgoing" | "incoming" | "admin",
//   createdAt
// }
//
// This is what links a signed-in Firebase Auth user to a specific org and
// role, so pages like HandoverPacket.jsx know which packet is "theirs"
// without needing an org ID in the URL.

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