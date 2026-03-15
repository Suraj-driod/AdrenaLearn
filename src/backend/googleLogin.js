// google.js
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "./firebase"; // Make sure this path matches where your firebase.js is located

// Initialize the Google Auth Provider
const provider = new GoogleAuthProvider();

// Function to trigger the Google Sign-In popup
export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    
    console.log("Successfully logged in as:", user.displayName);
    return user;
    
  } catch (error) {
    console.error("Error signing in with Google:", error.message);
    throw error;
  }
};