import { initializeApp } from "firebase/app";
import { getFirestore, doc, updateDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCGK-OO27Xc0cME6kGky8C9TLaY-CRsw-I",
  authDomain: "adrenalearn-99098.firebaseapp.com",
  projectId: "adrenalearn-99098",
  storageBucket: "adrenalearn-99098.firebasestorage.app",
  messagingSenderId: "963188496139",
  appId: "1:963188496139:web:c17138dcb909b82ed7f40e"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const migrations = [
  { id: "ce-lesson-1", topic: "variables" },
  { id: "ce-lesson-2", topic: "control-flow" },
  { id: "ce-lesson-3", topic: "loops" },
  { id: "ce-lesson-4", topic: "functions-and-modules" },
  { id: "ce-lesson-5", topic: "list-and-dictionaries" },
];

async function migrate() {
  console.log("Starting topic migration for old lessons...");
  for (const m of migrations) {
    try {
      const ref = doc(db, "lessons", m.id);
      await updateDoc(ref, { topic: m.topic });
      console.log(`Updated ${m.id} with topic ${m.topic}`);
    } catch (e) {
      console.error(`Error updating ${m.id}:`, e.message);
    }
  }
  console.log("Done.");
  process.exit(0);
}

migrate();
