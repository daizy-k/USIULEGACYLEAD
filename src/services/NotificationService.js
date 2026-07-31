import { collection, addDoc, getDocs, doc, updateDoc, query, orderBy, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase/config";

export async function createNotification(uid, { type, message, relatedPacketId }) {
  await addDoc(collection(db, "users", uid, "notifications"), {
    type,
    message,
    relatedPacketId: relatedPacketId || null,
    read: false,
    createdAt: serverTimestamp(),
  });
}

export async function getNotifications(uid) {
  const q = query(collection(db, "users", uid, "notifications"), orderBy("createdAt", "desc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function markAsRead(uid, notificationId) {
  await updateDoc(doc(db, "users", uid, "notifications", notificationId), { read: true });
}

export async function markAllAsRead(uid, notifications) {
  const unread = notifications.filter((n) => !n.read);
  await Promise.all(unread.map((n) => markAsRead(uid, n.id)));
}