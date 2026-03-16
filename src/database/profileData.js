import { db } from "../backend/firebase";
import { 
  doc, 
  getDoc, 
  collection, 
  getDocs, 
  query, 
  orderBy, 
  limit 
} from "firebase/firestore";

/**
 * Aggregates all user-specific data for the Profile Page.
 * @param {string} uid - The Firebase User ID
 */
export const fetchProfileData = async (uid) => {
  try {
    // 1. GET MAIN USER DOC (Name, Email, Course, XP)
    const userRef = doc(db, "users", uid);
    const userSnap = await getDoc(userRef);
    
    if (!userSnap.exists()) throw new Error("User profile not found");
    const userData = userSnap.data();

    // Calculate Total XP from the points map
    const pointsObj = userData.points || {};
    const totalXP = Object.values(pointsObj).reduce((sum, val) => sum + (val || 0), 0);

    // 2. GET LESSON PROGRESS (Count completed lessons)
    const lessonProgressRef = collection(db, `users/${uid}/lessonProgress`);
    const lessonSnap = await getDocs(lessonProgressRef);
    const lessonsDoneCount = lessonSnap.docs.filter(d => d.data().status === "completed").length;

    // 3. GET GAME PERFORMANCE & ACCURACY
    const attemptsRef = collection(db, `users/${uid}/gameAttempts`);
    const attemptsSnap = await getDocs(attemptsRef);
    
    let totalCorrect = 0;
    let totalGamesPlayed = attemptsSnap.size;
    const gameStats = {}; // To group data by gameId

    attemptsSnap.forEach((doc) => {
      const att = doc.data();
      totalCorrect += (att.questionsCorrect || 0);

      // Grouping for the "Mastery" section
      if (!gameStats[att.gameId]) {
        gameStats[att.gameId] = { totalScore: 0, count: 0 };
      }
      gameStats[att.gameId].totalScore += (att.score || 0);
      gameStats[att.gameId].count += 1;
    });

    // Assume 10 questions per game for accuracy calculation
    const avgAccuracy = totalGamesPlayed > 0 
      ? Math.round((totalCorrect / (totalGamesPlayed * 10)) * 100) 
      : 0;

    // 4. GET EARNED BADGES
    const badgesRef = collection(db, `users/${uid}/earnedBadges`);
    const badgesSnap = await getDocs(badgesRef);
    const earnedBadgeIds = badgesSnap.docs.map(d => d.id); // Array of strings like ['speed-demon']

    // 5. COMPILE RECENT ACTIVITY (Mixed Lessons and Games)
    const recentActivity = [];
    
    // Get last 3 game attempts
    const recentGamesQuery = query(attemptsRef, orderBy("completedAt", "desc"), limit(3));
    const recentGamesSnap = await getDocs(recentGamesQuery);
    
    recentGamesSnap.forEach(doc => {
      const d = doc.data();
      recentActivity.push({
        action: `Played ${d.gameId} Mission`,
        time: d.completedAt?.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) || "Just now",
        type: 'game',
        gameId: d.gameId,
        timestamp: d.completedAt?.toMillis() || 0
      });
    });

    // 6. FORMAT DATA FOR COMPONENT
    return {
      user: {
        name: userData.username || "Anonymous Operative",
        email: userData.mail || "unknown@email.com",
        course: userData.userCourses?.[0]?.courseId === 'ce' ? "Computer Engineering" : "General Studies",
        createdAt: userData.createdAt?.toDate().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) || "Jan 2026"
      },
      stats: {
        totalXP,
        lessonsDone: lessonsDoneCount,
        avgAccuracy: `${avgAccuracy}%`,
        globalRank: "#42" // Typically calculated via a separate leaderboard function
      },
      earnedBadgeIds,
      gamePerformance: Object.keys(gameStats).map(id => ({
        id: id,
        avgScore: Math.round(gameStats[id].totalScore / gameStats[id].count),
        games: gameStats[id].count
      })),
      recentActivity: recentActivity.sort((a, b) => b.timestamp - a.timestamp)
    };

  } catch (error) {
    console.error("Error in fetchProfileData:", error);
    throw error;
  }
};