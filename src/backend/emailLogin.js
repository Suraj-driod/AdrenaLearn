import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut,
  updateProfile 
} from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "./firebase";

// 1. Register a new user (and save their Full Name & optional Interests)
export const registerWithEmail = async (name, email, password, interests = '') => {
  try {
    // Create the user in Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Attach the Full Name to the newly created user profile
    if (name) {
      await updateProfile(user, {
        displayName: name
      });
    }

    // Persist initial user profile doc with interests in Firestore
    try {
      const userRef = doc(db, 'users', user.uid);
      await setDoc(userRef, {
        username: name || email.split('@')[0] || 'Student',
        mail: email,
        photoURL: user.photoURL || '',
        userCourses: [],
        interests: interests ? interests.trim() : '',
        lessonQuota: 5,
        quotaPeriod: 'daily',
        points: {},
        gameCounts: {},
        lastPlayed: {},
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      }, { merge: true });
    } catch (dbErr) {
      console.warn('Could not write initial user doc with interests:', dbErr);
    }

    if (typeof window !== 'undefined' && interests && interests.trim()) {
      localStorage.setItem('adrenalearn_user_interests', interests.trim());
    }

    console.log("Successfully registered:", user.displayName || user.email);
    return user;

  } catch (error) {
    console.error("Error during registration:", error.message);
    throw error;
  }
};

// 2. Log in an existing user
export const loginWithEmail = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    console.log("Successfully logged in:", user.email);
    return user;

  } catch (error) {
    console.error("Error logging in:", error.message);
    throw error;
  }
};

// 3. Log out the current user
export const logoutUser = async () => {
  try {
    await signOut(auth);
    console.log("User logged out successfully");
  } catch (error) {
    console.error("Error logging out:", error.message);
    throw error;
  }
};