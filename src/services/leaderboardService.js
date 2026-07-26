import {
  collection,
  getDocs,
  orderBy,
  query,
  limit,
} from "firebase/firestore";
import { db } from "../firebase/config";

const COLLECTION_NAME = "users";

/**
 * Fetch top users ordered by points descending
 * @param {number} maxResults - Optional limit on the number of leaderboard entries
 */
export async function getLeaderboard(maxResults = 50) {
  try {
    const q = query(
      collection(db, COLLECTION_NAME),
      orderBy("points", "desc"),
      limit(maxResults)
    );

    const snapshot = await getDocs(q);

    return snapshot.docs.map((doc, index) => ({
      id: doc.id,
      rank: index + 1, // Dynamically calculates rank position
      ...doc.data(),
    }));
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    throw error;
  }
}