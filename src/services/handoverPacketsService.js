import {
  addDoc,
  collection,
  getDocs,
  getDoc,
  doc,
  updateDoc,
  query,
  where,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase/config";

const COLLECTION_NAME = "handoverPackets";

/**
 * Default structure matching Figma form fields
 */
const DEFAULT_PACKET_SHAPE = {
  clubId: "",
  outgoingLeader: "",
  incomingLeader: "",

  yearInReview: "",
  ongoingProjects: "",
  keyContacts: "",
  documents: [],

  comments: [],

  status: "draft",

  accepted: false,
};

/**
 * Create a new handover packet with default fields and server timestamps
 */
export async function createPacket(packet) {
  try {
    const docRef = await addDoc(collection(db, COLLECTION_NAME), {
      ...DEFAULT_PACKET_SHAPE,
      ...packet,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error("Error creating packet:", error);
    throw error;
  }
}

/**
 * Update an existing packet by ID with updated server timestamp
 */
export async function updatePacket(id, updates) {
  try {
    const packetRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(packetRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error(`Error updating packet ${id}:`, error);
    throw error;
  }
}

/**
 * Fetch a single packet by ID
 */
export async function getPacket(id) {
  try {
    const snapshot = await getDoc(doc(db, COLLECTION_NAME, id));

    if (!snapshot.exists()) return null;

    return {
      id: snapshot.id,
      ...snapshot.data(),
    };
  } catch (error) {
    console.error(`Error fetching packet ${id}:`, error);
    throw error;
  }
}

/**
 * Fetch all packets for a specific club
 */
export async function getClubPackets(clubId) {
  try {
    const q = query(
      collection(db, COLLECTION_NAME),
      where("clubId", "==", clubId)
    );

    const snapshot = await getDocs(q);

    return snapshot.docs.map((packetDoc) => ({
    id: packetDoc.id,
    ...packetDoc.data(),    
    }));
  } catch (error) {
    console.error(`Error fetching packets for club ${clubId}:`, error);
    throw error;
  }
}

/**
 * Transition packet status to submitted
 */
export async function submitPacket(packetId) {
  return updatePacket(packetId, { status: "submitted" });
}

/**
 * Transition packet status to accepted
 */
export async function acceptPacket(packetId) {
  return updatePacket(packetId, { status: "accepted" });
}