import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut,
  updateProfile 
} from "firebase/auth";
import { auth } from "./firebase"; // Adjust path if necessary

// 1. Register a new user (and save their Full Name)
export const registerWithEmail = async (name, email, password) => {
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

    console.log("Successfully registered:", user.displayName || user.email);
    return user;

  } catch (error) {
    console.error("Error during registration:", error.message);
    throw error; // Throwing allows your React component to catch and display the error
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