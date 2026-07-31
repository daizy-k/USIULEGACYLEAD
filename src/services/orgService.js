import { collection, addDoc, updateDoc, getDocs, doc, getDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase/config";

const ORGS_COLLECTION = "organizations";

export async function createOrganization({ name, icon, category }) {
  const docRef = await addDoc(collection(db, ORGS_COLLECTION), {
    name,
    icon: icon || "🏫",
    category: category || "",
    deadline: "",
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function getAllOrganizations() {
  const snapshot = await getDocs(collection(db, ORGS_COLLECTION));
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function getOrganization(orgId) {
  const snap = await getDoc(doc(db, ORGS_COLLECTION, orgId));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() };
}

export async function updateOrganizationDeadline(orgId, deadline) {
  await updateDoc(doc(db, ORGS_COLLECTION, orgId), {
    deadline,
    updatedAt: serverTimestamp(),
  });
}