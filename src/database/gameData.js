import { db } from "../backend/firebase";
import { doc, updateDoc, increment, serverTimestamp } from "firebase/firestore";

export const addInterviewPoints = async (uid, points) => {
  if (!uid || points <= 0) return;

  try {
    const userRef = doc(db, "users", uid);
    
    // According to your schema, we update the points map.
    // We'll store interview points in a specific 'interview' key.
    await updateDoc(userRef, {
      "points.interview": increment(points),
      updatedAt: serverTimestamp()
    });
    
    console.log(`${points} bonus points added to user ${uid}`);
  } catch (error) {
    console.error("Error adding interview points:", error);
    throw error;
  }
};