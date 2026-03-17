import { db } from "../backend/firebase";
import { 
  collection, 
  getDocs, 
  getDoc, 
  doc, 
  query, 
  where,
  updateDoc,
  setDoc,
  arrayUnion,
  serverTimestamp
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

/**
 * Registers a user for a course by adding it to their userCourses array.
 * @param {string} uid - The Firebase User ID
 * @param {string} courseId - The Course ID to register for
 */
export const registerForCourse = async (uid, courseId) => {
  try {
    const userRef = doc(db, "users", uid);
    await updateDoc(userRef, {
      userCourses: arrayUnion({
        courseId,
        status: "active",
        enrolledAt: new Date().toISOString()
      }),
      updatedAt: serverTimestamp()
    });
    return true;
  } catch (error) {
    console.error("Error registering for course:", error);
    throw error;
  }
};

/**
 * Marks a lesson as completed in the user's lessonProgress subcollection.
 * Idempotent — calling it again for the same lesson just updates the timestamp.
 * @param {string} uid - The Firebase User ID
 * @param {string} courseId - The Course ID the lesson belongs to
 * @param {string} lessonId - The Lesson ID to mark as completed
 */
export const markLessonCompleted = async (uid, courseId, lessonId) => {
  try {
    const progressRef = doc(db, `users/${uid}/lessonProgress`, `${courseId}_${lessonId}`);
    await setDoc(progressRef, {
      lessonId,
      courseId,
      status: "completed",
      completedAt: serverTimestamp()
    }, { merge: true });
    return true;
  } catch (error) {
    console.error("Error marking lesson as completed:", error);
    throw error;
  }
};

/**
 * Checks if a user is registered for a specific course.
 * @param {string} uid - The Firebase User ID
 * @param {string} courseId - The Course ID to check
 * @returns {boolean} true if registered, false otherwise
 */
export const isUserRegistered = async (uid, courseId) => {
  try {
    const userRef = doc(db, "users", uid);
    const userSnap = await getDoc(userRef);
    if (!userSnap.exists()) return false;

    const userData = userSnap.data();
    const userCourses = userData.userCourses || [];
    return userCourses.some(c => c.courseId === courseId);
  } catch (error) {
    console.error("Error checking registration status:", error);
    return false;
  }
};