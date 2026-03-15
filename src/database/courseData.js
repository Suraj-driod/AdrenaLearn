import { db } from "../backend/firebase";
import { 
  collection, 
  getDocs, 
  getDoc, 
  doc, 
  query, 
  where 
} from "firebase/firestore";

/**
 * Fetches all available courses and merges them with the specific user's progress.
 * @param {string} uid - The Firebase User ID
 */
export const fetchUserCourses = async (uid) => {
  try {
    // 1. Fetch the Global Courses collection
    const coursesSnap = await getDocs(collection(db, "courses"));
    const allCourses = coursesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // 2. Fetch the User's Main Document (to see which courses they joined)
    const userRef = doc(db, "users", uid);
    const userSnap = await getDoc(userRef);
    if (!userSnap.exists()) return []; // Return empty if user doesn't exist

    const userData = userSnap.data();
    const userJoinedCourses = userData.userCourses || [];

    // 3. Fetch the User's Lesson Progress subcollection
    // This tells us which specific lessons are "completed"
    const progressSnap = await getDocs(collection(db, `users/${uid}/lessonProgress`));
    const completedLessonIds = progressSnap.docs
      .filter(d => d.data().status === "completed")
      .map(d => d.data().lessonId);

    // 4. Merge Data
    const formattedCourses = allCourses.map(course => {
      // Check if user has joined this specific course
      const joinedInfo = userJoinedCourses.find(c => c.courseId === course.id);
      const isStarted = !!joinedInfo;

      // Calculate progress: (Completed Lessons in this course / Total Lessons in course) * 100
      const courseLessonIds = course.courseLessons || [];
      const completedInThisCourse = courseLessonIds.filter(id => completedLessonIds.includes(id)).length;
      
      const progressPercent = courseLessonIds.length > 0 
        ? Math.round((completedInThisCourse / courseLessonIds.length) * 100) 
        : 0;

      return {
        id: course.id,
        name: course.courseName || "Untitled Course",
        lessons: courseLessonIds.length,
        difficulty: course.difficulty || "Beginner",
        desc: course.courseDesc || "",
        category: course.category || "General", // Ensure you have a category field for filters
        bgColor: course.bgColor || "bg-[#e4f1ff]", // Store preferred color in Firestore
        iconColor: course.iconColor || "text-[#3b82f6]",
        progress: progressPercent,
        started: isStarted,
        status: joinedInfo?.status || "not-started"
      };
    });

    return formattedCourses;

  } catch (error) {
    console.error("Error fetching course data:", error);
    throw error;
  }
};