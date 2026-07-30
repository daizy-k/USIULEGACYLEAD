// Personal scratchpad notes — NOT tied to any specific handover packet.
// Stored as their own subcollection so each note can be edited/deleted
// independently: users/{uid}/notes/{noteId}
// { text, createdAt, updatedAt }
//
// (Earlier version stored notes as a single array field on the user doc —
// that's why old test notes may show "Invalid Date": they used a plain
// JS ISO string instead of Firestore's serverTimestamp(), which is what
// the rest of the app uses. This version fixes that by using
// serverTimestamp() + .toDate() consistently, matching handoverService.js.
// Old array-based notes are orphaned, not migrated — safe to ignore or
// manually clear the old `notes` array field on your user doc in the
// Firebase console.)

import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  query,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase/config";

function notesCollection(uid) {
  return collection(db, "users", uid, "notes");
}

export async function addNote(uid, text) {
  const docRef = await addDoc(notesCollection(uid), {
    text,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function getNotes(uid) {
  const q = query(notesCollection(uid), orderBy("createdAt", "desc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function updateNote(uid, noteId, text) {
  await updateDoc(doc(db, "users", uid, "notes", noteId), {
    text,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteNote(uid, noteId) {
  await deleteDoc(doc(db, "users", uid, "notes", noteId));
}