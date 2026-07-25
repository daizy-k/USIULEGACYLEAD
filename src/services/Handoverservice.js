// Handles reading/writing handover packets in Firestore.
// Collection shape: handoverPackets/{packetId}
// {
//   orgId, orgName,
//   outgoingLeaderId, outgoingLeaderName,
//   incomingLeaderId, incomingLeaderName,
//   yearInReview, ongoingProjects, keyContacts,
//   notes,                          <- private scratchpad, not part of the formal submission
//   documents: [{ name, url, publicId, uploadedAt }],
//   status: "draft" | "pending_admin_review" | "changes_requested" | "pending_incoming_review" | "complete",
//   adminNote,                      <- admin's feedback if they requested changes
//   comments: [{ authorId, authorName, text, createdAt }],
//   createdAt, updatedAt, submittedAt, adminReviewedAt, acceptedAt
// }

import {
  collection,
  doc,
  addDoc,
  updateDoc,
  getDoc,
  getDocs,
  query,
  where,
  arrayUnion,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase/config";

const PACKETS_COLLECTION = "handoverPackets";

const REQUIRED_FIELDS = ["yearInReview", "ongoingProjects", "keyContacts"];

export function getMissingFields(packetData) {
  return REQUIRED_FIELDS.filter((field) => !packetData[field]?.trim());
}

export async function createDraftPacket({ orgId, orgName, outgoingLeaderId, outgoingLeaderName }) {
  const docRef = await addDoc(collection(db, PACKETS_COLLECTION), {
    orgId,
    orgName,
    outgoingLeaderId,
    outgoingLeaderName,
    incomingLeaderId: null,
    incomingLeaderName: null,
    yearInReview: "",
    ongoingProjects: "",
    keyContacts: "",
    notes: "",
    documents: [],
    comments: [],
    status: "draft",
    adminNote: "",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function getOrCreateDraftPacket({ orgId, orgName, outgoingLeaderId, outgoingLeaderName }) {
  const q = query(
    collection(db, PACKETS_COLLECTION),
    where("orgId", "==", orgId),
    where("outgoingLeaderId", "==", outgoingLeaderId)
  );
  const snapshot = await getDocs(q);
  // Resume an existing draft, or one sent back for changes — both are still editable.
  const resumable = snapshot.docs.find((d) =>
    ["draft", "changes_requested"].includes(d.data().status)
  );
  if (resumable) {
    return resumable.id;
  }
  return createDraftPacket({ orgId, orgName, outgoingLeaderId, outgoingLeaderName });
}

/**
 * Used by an incoming leader: finds an ADMIN-APPROVED packet for their org
 * and claims it as theirs. Packets still awaiting admin review are not
 * visible to incoming leaders at all — this is the enforcement point for
 * that separation.
 */
export async function getOrClaimPacketForOrg(orgId, incomingLeaderId, incomingLeaderName) {
  const q = query(collection(db, PACKETS_COLLECTION), where("orgId", "==", orgId));
  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;

  // Already claimed by this person? Go straight back, regardless of status
  // (so they can revisit a packet they've already accepted).
  let target = snapshot.docs.find((d) => d.data().incomingLeaderId === incomingLeaderId);

  if (!target) {
    // Only packets the admin has approved are claimable.
    const approved = snapshot.docs.filter((d) => d.data().status === "pending_incoming_review");
    if (approved.length === 0) return null;

    target = [...approved].sort((a, b) => {
      const aTime = a.data().updatedAt?.toMillis?.() || 0;
      const bTime = b.data().updatedAt?.toMillis?.() || 0;
      return bTime - aTime;
    })[0];

    await updateDoc(target.ref, {
      incomingLeaderId,
      incomingLeaderName,
      updatedAt: serverTimestamp(),
    });
  }

  return target.id;
}

export async function saveDraft(packetId, fields) {
  const packetRef = doc(db, PACKETS_COLLECTION, packetId);
  await updateDoc(packetRef, {
    ...fields,
    updatedAt: serverTimestamp(),
  });
}

export async function addDocumentsToPacket(packetId, uploadedDocs) {
  const packetRef = doc(db, PACKETS_COLLECTION, packetId);
  await updateDoc(packetRef, {
    documents: arrayUnion(...uploadedDocs),
    updatedAt: serverTimestamp(),
  });
}

/**
 * Outgoing leader submits — this now goes to the ADMIN first, not the
 * incoming leader directly.
 */
export async function submitPacket(packetId, currentData) {
  const missing = getMissingFields(currentData);
  if (missing.length > 0) {
    throw new Error(`Missing required fields: ${missing.join(", ")}`);
  }

  const packetRef = doc(db, PACKETS_COLLECTION, packetId);
  await updateDoc(packetRef, {
    status: "pending_admin_review",
    submittedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  // TODO: notify admins that a packet is waiting — Cloud Function watching
  // for status change to "pending_admin_review".
}

/**
 * Admin approves a submitted packet, opening it up for an incoming leader
 * to claim and review.
 */
export async function adminApprovePacket(packetId) {
  const packetRef = doc(db, PACKETS_COLLECTION, packetId);
  await updateDoc(packetRef, {
    status: "pending_incoming_review",
    adminNote: "",
    adminReviewedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  // TODO: notify the outgoing leader it was approved, and notify/prompt
  // an incoming leader to claim it — Cloud Function territory.
}

/**
 * Admin sends a packet back to the outgoing leader with feedback.
 */
export async function adminRequestChanges(packetId, note) {
  const packetRef = doc(db, PACKETS_COLLECTION, packetId);
  await updateDoc(packetRef, {
    status: "changes_requested",
    adminNote: note,
    adminReviewedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function addComment(packetId, { authorId, authorName, text }) {
  const packetRef = doc(db, PACKETS_COLLECTION, packetId);
  await updateDoc(packetRef, {
    comments: arrayUnion({
      authorId,
      authorName,
      text,
      createdAt: new Date().toISOString(),
    }),
    updatedAt: serverTimestamp(),
  });
}

/**
 * Incoming leader formally accepts the handover — final step.
 */
export async function acceptPacket(packetId) {
  const packetRef = doc(db, PACKETS_COLLECTION, packetId);
  await updateDoc(packetRef, {
    status: "complete",
    acceptedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function getPacket(packetId) {
  const packetRef = doc(db, PACKETS_COLLECTION, packetId);
  const snapshot = await getDoc(packetRef);
  if (!snapshot.exists()) return null;
  return { id: snapshot.id, ...snapshot.data() };
}

export async function getPacketsForOrg(orgId) {
  const q = query(collection(db, PACKETS_COLLECTION), where("orgId", "==", orgId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function getAllPackets() {
  const snapshot = await getDocs(collection(db, PACKETS_COLLECTION));
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
}