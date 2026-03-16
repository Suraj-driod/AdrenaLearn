import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore"; // 1. Add this

const firebaseConfig = {
  apiKey: "AIzaSyCGK-OO27Xc0cME6kGky8C9TLaY-CRsw-I",
  authDomain: "adrenalearn-99098.firebaseapp.com",
  projectId: "adrenalearn-99098",
  storageBucket: "adrenalearn-99098.firebasestorage.app",
  messagingSenderId: "963188496139",
  appId: "1:963188496139:web:c17138dcb909b82ed7f40e"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app); 
export const db = getFirestore(app); // 2. Add this export