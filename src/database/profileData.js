import { db } from "../backend/firebase";
import { 
  doc, 
  getDoc, 
  collection, 
  getDocs, 
  query, 
  orderBy, 
  limit,
  updateDoc,
  setDoc,
  serverTimestamp,
  deleteDoc
} from "firebase/firestore";

// ─── Display name map for known game IDs ────────────────────────────────
const GAME_DISPLAY_NAMES = {
  balloon: "Precision Pop",
  "kat-mage": "Kat-Mage",
  "among-us": "Among-Us",
  spaceship: "Spaceship",
  subway: "Subway",
  interview: "Interview",
};

/**
 * Calculates the user's global rank by comparing their total XP
 * against all users in the database.
 */
const calculateGlobalRank = async (uid, userTotalXP) => {
  try {
    const usersSnap = await getDocs(collection(db, "users"));
    const allScores = [];

    usersSnap.forEach((userDoc) => {
      const data = userDoc.data();
      const pts = Object.values(data.points || {}).reduce((s, v) => s + (v || 0), 0);
      allScores.push({ uid: userDoc.id, pts });
    });

    allScores.sort((a, b) => b.pts - a.pts);
    const rank = allScores.findIndex((u) => u.uid === uid) + 1;
    return rank > 0 ? `#${rank}` : "#-";
  } catch {
    return "#-";
  }
};

/**
 * Evaluates which badges the user has earned based on actual activity data.
 * Writes/removes badge docs in the `earnedBadges` subcollection.
 */
const evaluateAndSyncBadges = async (uid, {
  lessonsDone,
  totalGamesPlayed,
  hasPerfectScore,
  hasFastRound,
  currentStreak,
  globalRankNum,
}) => {
  const badgesRef = collection(db, `users/${uid}/earnedBadges`);
  const badgesSnap = await getDocs(badgesRef);
  const existingIds = new Set(badgesSnap.docs.map((d) => d.id));

  const badgeConditions = [
    { id: "first-lesson", earned: lessonsDone >= 1 },
    { id: "3-day-streak", earned: currentStreak >= 3 },
    { id: "perfect-score", earned: hasPerfectScore },
    { id: "top-10", earned: globalRankNum > 0 && globalRankNum <= 10 },
    { id: "speed-demon", earned: hasFastRound },
    { id: "week-warrior", earned: currentStreak >= 7 },
  ];

  const earnedIds = [];

  for (const badge of badgeConditions) {
    if (badge.earned) {
      earnedIds.push(badge.id);
      if (!existingIds.has(badge.id)) {
        // Award new badge
        await setDoc(doc(db, `users/${uid}/earnedBadges`, badge.id), {
          earnedAt: serverTimestamp(),
        });
      }
    }
  }

  return earnedIds;
};

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
    let totalQuestionsAsked = 0;
    let totalGamesPlayed = attemptsSnap.size;
    let hasPerfectScore = false;
    let hasFastRound = false;
    const gameStats = {}; // To group data by gameId

    attemptsSnap.forEach((docSnap) => {
      const att = docSnap.data();
      const correct = att.questionsCorrect || 0;
      const total = att.totalQuestions || 10;
      totalCorrect += correct;
      totalQuestionsAsked += total;

      // Check for perfect score (all correct)
      if (correct > 0 && correct >= total) {
        hasPerfectScore = true;
      }

      // Check for speed demon (round completed in under 60 seconds)
      if (att.completedAt && att.startedAt) {
        const durationSec = (att.completedAt.toMillis() - att.startedAt.toMillis()) / 1000;
        if (durationSec > 0 && durationSec < 60) {
          hasFastRound = true;
        }
      }
      // Also check a `durationSeconds` field if it exists
      if (att.durationSeconds && att.durationSeconds < 60) {
        hasFastRound = true;
      }

      // Grouping for the "Mastery" section
      const gId = att.gameId || "unknown";
      if (!gameStats[gId]) {
        gameStats[gId] = { totalScore: 0, count: 0 };
      }
      gameStats[gId].totalScore += (att.score || 0);
      gameStats[gId].count += 1;
    });

    const avgAccuracy = totalQuestionsAsked > 0 
      ? Math.round((totalCorrect / totalQuestionsAsked) * 100) 
      : 0;

    // 4. GET GLOBAL RANK (real calculation)
    const globalRankStr = await calculateGlobalRank(uid, totalXP);
    const globalRankNum = parseInt(globalRankStr.replace("#", "")) || 999;

    // 5. EVALUATE & SYNC BADGES
    const currentStreak = userData.currentStreak || 0;
    const earnedBadgeIds = await evaluateAndSyncBadges(uid, {
      lessonsDone: lessonsDoneCount,
      totalGamesPlayed,
      hasPerfectScore,
      hasFastRound,
      currentStreak,
      globalRankNum,
    });

    // 6. COMPILE RECENT ACTIVITY (last 10 game attempts + lessons)
    const recentActivity = [];
    
    // Get last 5 game attempts
    const recentGamesQuery = query(attemptsRef, orderBy("completedAt", "desc"), limit(5));
    const recentGamesSnap = await getDocs(recentGamesQuery);
    
    recentGamesSnap.forEach(docSnap => {
      const d = docSnap.data();
      const gameName = GAME_DISPLAY_NAMES[d.gameId] || d.gameId || "Game";
      recentActivity.push({
        action: `Played ${gameName} Mission`,
        time: d.completedAt?.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) || "Just now",
        date: d.completedAt?.toDate().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) || "",
        type: 'game',
        gameId: d.gameId,
        score: d.score || 0,
        timestamp: d.completedAt?.toMillis() || 0
      });
    });

    // Get last 5 completed lessons
    const recentLessonsQuery = query(
      lessonProgressRef,
      orderBy("completedAt", "desc"),
      limit(5)
    );
    try {
      const recentLessonsSnap = await getDocs(recentLessonsQuery);
      recentLessonsSnap.forEach(docSnap => {
        const d = docSnap.data();
        if (d.status === "completed") {
          recentActivity.push({
            action: `Completed ${d.lessonName || d.lessonId || "Lesson"}`,
            time: d.completedAt?.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) || "Recently",
            date: d.completedAt?.toDate().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) || "",
            type: 'lesson',
            gameId: null,
            timestamp: d.completedAt?.toMillis() || 0
          });
        }
      });
    } catch {
      // lessonProgress might not have the completedAt index, skip
    }

    // Determine course
    const COURSE_ID_TO_NAME = {
      ce: "Computer Engineering",
      cs: "Computer Science",
      it: "Information Technology",
      general: "General Studies",
    };
    let courseName = "General Studies";
    if (userData.userCourses && userData.userCourses.length > 0) {
      const courseId = userData.userCourses[0].courseId;
      try {
        const courseSnap = await getDoc(doc(db, "courses", courseId));
        if (courseSnap.exists()) {
          courseName = courseSnap.data().courseName || COURSE_ID_TO_NAME[courseId] || "General Studies";
        } else {
          // Doc doesn't exist in Firestore — use local map
          courseName = COURSE_ID_TO_NAME[courseId] || "General Studies";
        }
      } catch {
        courseName = COURSE_ID_TO_NAME[courseId] || "General Studies";
      }
    }

    // 7. FORMAT DATA FOR COMPONENT
    return {
      user: {
        name: userData.username || "Anonymous Operative",
        email: userData.mail || "unknown@email.com",
        course: courseName,
        photoURL: userData.photoURL || "",
        createdAt: userData.createdAt?.toDate().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) || "Jan 2026",
        currentStreak,
      },
      stats: {
        totalXP,
        lessonsDone: lessonsDoneCount,
        avgAccuracy: `${avgAccuracy}%`,
        globalRank: globalRankStr,
      },
      earnedBadgeIds,
      gamePerformance: Object.keys(gameStats).map(id => ({
        id,
        displayName: GAME_DISPLAY_NAMES[id] || id,
        avgScore: gameStats[id].totalScore,  // Total XP for this game
        games: gameStats[id].count,
      })),
      recentActivity: recentActivity.sort((a, b) => b.timestamp - a.timestamp).slice(0, 8),
    };

  } catch (error) {
    console.error("Error in fetchProfileData:", error);
    throw error;
  }
};

/**
 * Updates the user's profile fields in Firestore.
 * @param {string} uid - The Firebase User ID
 * @param {Object} updates - Object with fields to update (username, course, photoURL)
 */
export const updateProfileData = async (uid, updates) => {
  try {
    const userRef = doc(db, "users", uid);
    const updatePayload = { updatedAt: serverTimestamp() };

    if (updates.username !== undefined) {
      updatePayload.username = updates.username;
    }

    if (updates.photoURL !== undefined) {
      updatePayload.photoURL = updates.photoURL;
    }

    if (updates.courseId !== undefined) {
      // Replace the first course or set it fresh
      updatePayload.userCourses = [{ courseId: updates.courseId, status: "in-progress" }];
    }

    await updateDoc(userRef, updatePayload);
    return true;
  } catch (error) {
    console.error("Error updating profile:", error);
    throw error;
  }
};