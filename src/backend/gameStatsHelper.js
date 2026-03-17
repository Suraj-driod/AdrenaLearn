import { db } from "./firebase";
import { doc, collection, addDoc, updateDoc, increment, serverTimestamp } from "firebase/firestore";

/**
 * Updates user game statistics in Firebase when a game is completed.
 * 
 * @param {string} uid - Firebase User ID
 * @param {string} gameId - Identifier for the game (e.g., 'kat-mage', 'balloon', 'among-us', 'spaceship', 'subway')
 * @param {number} score - Final score achieved in the game
 * @param {number} questionsCorrect - Number of questions answered correctly
 * @param {number} totalQuestions - Total number of questions presented
 */
export const updateGameStats = async (uid, gameId, score, questionsCorrect, totalQuestions) => {
  if (!uid || typeof score !== 'number') return;

  try {
    // 1. Log the attempt for accuracy and detailed tracking
    const attemptsRef = collection(db, `users/${uid}/gameAttempts`);
    await addDoc(attemptsRef, {
      gameId,
      score,
      questionsCorrect,
      totalQuestions,
      completedAt: serverTimestamp()
    });

    // 2. Update the user's total points for this game to reflect in leaderboard and profile XP
    const userRef = doc(db, "users", uid);
    await updateDoc(userRef, {
      [`points.${gameId}`]: increment(score),
      updatedAt: serverTimestamp()
    });

    console.log(`Successfully updated stats for game ${gameId}. Earned ${score} XP.`);
  } catch (error) {
    console.error(`Error updating game stats for ${gameId}:`, error);
  }
};
