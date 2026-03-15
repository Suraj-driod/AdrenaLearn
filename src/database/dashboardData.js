import {db} from '../backend/firebase';
import { 
  doc, 
  getDoc, 
  collection, 
  query, 
  orderBy, 
  limit, 
  getDocs,
  where
} from "firebase/firestore";

export const fetchDashboardData = async (uid) => {
  try {
    // 1. FETCH USER DOC
    const userRef = doc(db, "users", uid);
    const userSnap = await getDoc(userRef);
    
    if (!userSnap.exists()) throw new Error("User not found");
    const userData = userSnap.data();

    // Calculate Total Points (XP)
    const pointsObj = userData.points || {};
    const totalXP = Object.values(pointsObj).reduce((sum, val) => sum + val, 0);

    // 2. FETCH RECENT GAME ATTEMPTS
    const gameAttemptsRef = collection(db, `users/${uid}/gameAttempts`);
    const recentGamesQuery = query(gameAttemptsRef, orderBy("completedAt", "desc"), limit(3));
    const recentGamesSnap = await getDocs(recentGamesQuery);
    
    // We will fetch all attempts just to calculate overall accuracy
    // (In a massive production app, you'd store 'averageAccuracy' directly on the user doc to save reads)
    const allAttemptsSnap = await getDocs(gameAttemptsRef);
    let totalQuestions = 0;
    let totalCorrect = 0;
    
    const recentGames = [];
    
    for (const attemptDoc of recentGamesSnap.docs) {
      const attempt = attemptDoc.data();
      
      // Fetch game details to get the name
      const gameSnap = await getDoc(doc(db, "games", attempt.gameId));
      const gameData = gameSnap.exists() ? gameSnap.data() : { gameName: "Unknown Game" };

      // Format date beautifully (e.g., "Mar 14, 2026")
      const date = attempt.completedAt?.toDate() 
        ? attempt.completedAt.toDate().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
        : "Recently";

      // Calculate accuracy for this specific game
      // Assuming maxScore relates to total questions, or you use questionsCorrect
      const accuracy = attempt.questionsCorrect && attempt.score 
        ? Math.round((attempt.questionsCorrect / (attempt.score / 10)) * 100) // Example math, adjust as needed
        : 0;

      recentGames.push({
        id: attemptDoc.id,
        gameId: attempt.gameId,
        mode: gameData.gameName,
        score: attempt.score || 0,
        accuracy: `${accuracy}%`,
        date: date
      });
    }

    // Calculate Global Accuracy
    allAttemptsSnap.forEach(doc => {
        const data = doc.data();
        if(data.questionsCorrect !== undefined) {
            totalCorrect += data.questionsCorrect;
            totalQuestions += 10; // Assuming 10 questions per game. Adjust based on your actual logic!
        }
    });
    const overallAccuracy = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;


    // 3. FETCH COURSE & LESSON PROGRESS
    let currentLesson = { name: "No active course", desc: "", progress: 0, completed: 0, total: 0 };
    
    if (userData.userCourses && userData.userCourses.length > 0) {
      const activeCourseId = userData.userCourses[0].courseId;
      const courseSnap = await getDoc(doc(db, "courses", activeCourseId));
      
      if (courseSnap.exists()) {
        const courseData = courseSnap.data();
        const totalLessons = courseData.courseLessons?.length || 1;

        // Fetch user's completed lessons for this course
        const progressQuery = query(
            collection(db, `users/${uid}/lessonProgress`), 
            where("courseId", "==", activeCourseId),
            where("status", "==", "completed")
        );
        const progressSnap = await getDocs(progressQuery);
        const completedLessonsCount = progressSnap.size;

        // Determine current lesson ID (the first one they haven't completed)
        const nextLessonIndex = Math.min(completedLessonsCount, totalLessons - 1);
        const currentLessonId = courseData.courseLessons[nextLessonIndex];

        // Fetch current lesson details
        if (currentLessonId) {
            const lessonSnap = await getDoc(doc(db, "lessons", currentLessonId));
            if (lessonSnap.exists()) {
                const lessonData = lessonSnap.data();
                currentLesson = {
                    name: lessonData.lessonName,
                    desc: lessonData.lessonDesc,
                    progress: Math.round((completedLessonsCount / totalLessons) * 100),
                    completed: completedLessonsCount,
                    total: totalLessons,
                    duration: lessonData.lessonDuration || "~10 min",
                    lessonIndex: nextLessonIndex + 1
                };
            }
        }
      }
    }

    // 4. FETCH LEADERBOARD & GLOBAL RANK
    // Note: Since we can't do orderBy("points.phaser" + "points.amongUs") in Firestore, 
    // we fetch users and sort in JS. (For a huge app, add a "totalPoints" field to your users schema!)
    const allUsersSnap = await getDocs(collection(db, "users"));
    const allUsers = [];
    
    allUsersSnap.forEach(doc => {
        const data = doc.data();
        const pts = Object.values(data.points || {}).reduce((sum, val) => sum + val, 0);
        allUsers.push({
            uid: doc.id,
            name: data.username || "Anonymous",
            points: pts,
            initials: (data.username || "A").substring(0, 2).toUpperCase()
        });
    });

    // Sort descending by points
    allUsers.sort((a, b) => b.points - a.points);
    
    // Find current user's rank
    const userRankIndex = allUsers.findIndex(u => u.uid === uid);
    const globalRank = userRankIndex !== -1 ? userRankIndex + 1 : "-";

    // Grab top 5 for the leaderboard
    const leaderboard = allUsers.slice(0, 5).map((u, index) => ({
        ...u,
        rank: index + 1
    }));

    // 5. RETURN COMPILED DATA
    return {
      user: {
        name: userData.username?.split(" ")[0] || "Student", // First name
        streak: 4, // Note: You'll need to add a currentStreak field to your schema to track this dynamically!
      },
      stats: {
        totalXP,
        accuracy: overallAccuracy,
        globalRank
      },
      currentLesson,
      recentGames,
      leaderboard
    };

  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    throw error;
  }
};