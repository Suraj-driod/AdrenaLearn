/**
 * Firestore Seed Script
 * Run with: node src/scripts/seedFirestore.mjs
 * 
 * This populates: courses, lessons, badges, games collections.
 * Uses the Firebase client SDK (same config as the app).
 */

import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc, Timestamp } from "firebase/firestore";

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

// ========== COURSES ==========
const courses = {
  ce: {
    courseName: "Computer Engineering",
    courseDesc: "Master the fundamentals of programming with Python. From variables to algorithms, build a strong foundation for your coding career.",
    courseLessons: ["ce-lesson-1", "ce-lesson-2", "ce-lesson-3", "ce-lesson-4", "ce-lesson-5"],
    difficulty: "Beginner",
    estimatedDuration: "8 hours",
    category: "Computer Engineering",
    bgColor: "bg-[#e4f1ff]",
    iconColor: "text-[#3b82f6]"
  },
  mba: {
    courseName: "MBA Fundamentals",
    courseDesc: "Learn business analytics and data-driven decision making. Apply coding to real-world business problems and case studies.",
    courseLessons: ["mba-lesson-1", "mba-lesson-2", "mba-lesson-3", "mba-lesson-4"],
    difficulty: "Intermediate",
    estimatedDuration: "6 hours",
    category: "MBA",
    bgColor: "bg-[#fff8e7]",
    iconColor: "text-[#ea580c]"
  },
  ds: {
    courseName: "Data Science Essentials",
    courseDesc: "Dive into data analysis with Python. Learn pandas, numpy, and visualization to extract insights from real datasets.",
    courseLessons: ["ds-lesson-1", "ds-lesson-2", "ds-lesson-3", "ds-lesson-4"],
    difficulty: "Intermediate",
    estimatedDuration: "7 hours",
    category: "Data Science",
    bgColor: "bg-[#d4f0e0]",
    iconColor: "text-[#1e7a4e]"
  }
};

// ========== LESSONS ==========
const lessons = {
  "ce-lesson-1": {
    lessonName: "Variables in Python",
    lessonDesc: "Learn what variables are, how to create them, and understand different data types in Python.",
    lessonLink: "https://www.youtube.com/embed/kqtD5dpn9C8",
    lessonDuration: "~15 min",
    lessonType: "video",
    courseId: "ce",
    concepts: ["Variables", "Data Types", "Assignment Operator", "Naming Rules"],
    chapters: [
      { time: "0:00", title: "Introduction to Variables" },
      { time: "2:15", title: "What is a Variable?" },
      { time: "5:30", title: "Data Types in Python" },
      { time: "8:45", title: "Assignment Operator" },
      { time: "11:20", title: "Variable Naming Rules" },
      { time: "14:00", title: "Summary & Next Steps" }
    ]
  },
  "ce-lesson-2": {
    lessonName: "Control Flow & Conditions",
    lessonDesc: "Master if-else statements, comparison operators, and logical operators to control your program's flow.",
    lessonLink: "https://www.youtube.com/embed/Zp5MuPOtsSY",
    lessonDuration: "~18 min",
    lessonType: "video",
    courseId: "ce",
    concepts: ["If Statements", "Else/Elif", "Comparison Operators", "Logical Operators"],
    chapters: [
      { time: "0:00", title: "Introduction to Control Flow" },
      { time: "3:00", title: "If Statements" },
      { time: "7:00", title: "Else and Elif" },
      { time: "11:00", title: "Comparison Operators" },
      { time: "15:00", title: "Logical Operators" }
    ]
  },
  "ce-lesson-3": {
    lessonName: "Loops in Python",
    lessonDesc: "Learn for loops, while loops, and how to iterate over data structures efficiently.",
    lessonLink: "https://www.youtube.com/embed/94UHCEmprCY",
    lessonDuration: "~20 min",
    lessonType: "video",
    courseId: "ce",
    concepts: ["For Loops", "While Loops", "Range Function", "Break & Continue"],
    chapters: [
      { time: "0:00", title: "Why Loops?" },
      { time: "3:00", title: "For Loops" },
      { time: "8:00", title: "While Loops" },
      { time: "13:00", title: "Range & Iteration" },
      { time: "17:00", title: "Break & Continue" }
    ]
  },
  "ce-lesson-4": {
    lessonName: "Functions & Modules",
    lessonDesc: "Write reusable code with functions. Learn parameters, return values, and how to import modules.",
    lessonLink: "https://www.youtube.com/embed/u-OmVr_fT4s",
    lessonDuration: "~22 min",
    lessonType: "video",
    courseId: "ce",
    concepts: ["Defining Functions", "Parameters", "Return Values", "Importing Modules"],
    chapters: [
      { time: "0:00", title: "Intro to Functions" },
      { time: "4:00", title: "Defining Functions" },
      { time: "9:00", title: "Parameters & Arguments" },
      { time: "14:00", title: "Return Values" },
      { time: "18:00", title: "Modules & Imports" }
    ]
  },
  "ce-lesson-5": {
    lessonName: "Lists & Dictionaries",
    lessonDesc: "Explore Python's core data structures. Learn to store, access, and manipulate collections of data.",
    lessonLink: "https://www.youtube.com/embed/W8KRzm-HUcc",
    lessonDuration: "~25 min",
    lessonType: "video",
    courseId: "ce",
    concepts: ["Lists", "List Methods", "Dictionaries", "Key-Value Pairs"],
    chapters: [
      { time: "0:00", title: "Introduction" },
      { time: "3:00", title: "Creating Lists" },
      { time: "8:00", title: "List Methods" },
      { time: "14:00", title: "Dictionaries" },
      { time: "20:00", title: "Nested Structures" }
    ]
  },
  "mba-lesson-1": {
    lessonName: "Business Analytics Intro",
    lessonDesc: "Understand how data drives business decisions. Learn the analytics lifecycle and key metrics.",
    lessonLink: "https://www.youtube.com/embed/JL_grPUnXzY",
    lessonDuration: "~15 min",
    lessonType: "video",
    courseId: "mba",
    concepts: ["Analytics Lifecycle", "KPIs", "Data Sources", "Decision Frameworks"],
    chapters: [
      { time: "0:00", title: "What is Business Analytics?" },
      { time: "4:00", title: "The Analytics Lifecycle" },
      { time: "8:00", title: "Key Performance Indicators" },
      { time: "12:00", title: "Data-Driven Decisions" }
    ]
  },
  "mba-lesson-2": {
    lessonName: "Excel for Business",
    lessonDesc: "Master essential Excel skills for business analysis: formulas, pivot tables, and data visualization.",
    lessonLink: "https://www.youtube.com/embed/Vl0H-qTclOg",
    lessonDuration: "~20 min",
    lessonType: "video",
    courseId: "mba",
    concepts: ["Formulas", "Pivot Tables", "Charts", "Data Cleaning"],
    chapters: [
      { time: "0:00", title: "Excel Basics Refresh" },
      { time: "5:00", title: "Essential Formulas" },
      { time: "10:00", title: "Pivot Tables" },
      { time: "15:00", title: "Charts & Visualization" }
    ]
  },
  "mba-lesson-3": {
    lessonName: "Python for Business",
    lessonDesc: "Apply Python programming to business problems. Automate reports and analyze datasets.",
    lessonLink: "https://www.youtube.com/embed/kqtD5dpn9C8",
    lessonDuration: "~18 min",
    lessonType: "video",
    courseId: "mba",
    concepts: ["Python Basics", "Pandas", "Automation", "Report Generation"],
    chapters: [
      { time: "0:00", title: "Why Python for Business?" },
      { time: "4:00", title: "Getting Started" },
      { time: "9:00", title: "Pandas for Data" },
      { time: "14:00", title: "Automating Reports" }
    ]
  },
  "mba-lesson-4": {
    lessonName: "Case Study: Market Analysis",
    lessonDesc: "Apply everything you've learned in a real-world market analysis case study.",
    lessonLink: "https://www.youtube.com/embed/JL_grPUnXzY",
    lessonDuration: "~25 min",
    lessonType: "video",
    courseId: "mba",
    concepts: ["Market Research", "Competitor Analysis", "SWOT", "Presentation"],
    chapters: [
      { time: "0:00", title: "Case Study Brief" },
      { time: "5:00", title: "Data Collection" },
      { time: "12:00", title: "Analysis Methods" },
      { time: "20:00", title: "Presenting Findings" }
    ]
  },
  "ds-lesson-1": {
    lessonName: "Intro to Data Science",
    lessonDesc: "Understand what data science is and learn the Python data science stack.",
    lessonLink: "https://www.youtube.com/embed/JL_grPUnXzY",
    lessonDuration: "~15 min",
    lessonType: "video",
    courseId: "ds",
    concepts: ["Data Science Pipeline", "Python Stack", "Jupyter Notebooks", "Data Types"],
    chapters: [
      { time: "0:00", title: "What is Data Science?" },
      { time: "4:00", title: "Python Data Stack" },
      { time: "8:00", title: "Getting Set Up" },
      { time: "12:00", title: "Your First Analysis" }
    ]
  },
  "ds-lesson-2": {
    lessonName: "NumPy Fundamentals",
    lessonDesc: "Learn numerical computing with NumPy arrays, operations, and broadcasting.",
    lessonLink: "https://www.youtube.com/embed/QUT1VHiLmmI",
    lessonDuration: "~20 min",
    lessonType: "video",
    courseId: "ds",
    concepts: ["Arrays", "Operations", "Broadcasting", "Math Functions"],
    chapters: [
      { time: "0:00", title: "Why NumPy?" },
      { time: "4:00", title: "Creating Arrays" },
      { time: "10:00", title: "Operations" },
      { time: "16:00", title: "Broadcasting" }
    ]
  },
  "ds-lesson-3": {
    lessonName: "Pandas for Data Analysis",
    lessonDesc: "Master DataFrames, data cleaning, and exploratory data analysis with Pandas.",
    lessonLink: "https://www.youtube.com/embed/vmEHCJofslg",
    lessonDuration: "~25 min",
    lessonType: "video",
    courseId: "ds",
    concepts: ["DataFrames", "Data Cleaning", "Grouping", "Merging"],
    chapters: [
      { time: "0:00", title: "Intro to Pandas" },
      { time: "5:00", title: "DataFrames" },
      { time: "12:00", title: "Data Cleaning" },
      { time: "20:00", title: "Analysis Patterns" }
    ]
  },
  "ds-lesson-4": {
    lessonName: "Data Visualization",
    lessonDesc: "Create stunning visualizations with Matplotlib and Seaborn to tell data stories.",
    lessonLink: "https://www.youtube.com/embed/a9UrKTVEeZA",
    lessonDuration: "~20 min",
    lessonType: "video",
    courseId: "ds",
    concepts: ["Matplotlib", "Seaborn", "Plot Types", "Customization"],
    chapters: [
      { time: "0:00", title: "Why Visualize?" },
      { time: "4:00", title: "Matplotlib Basics" },
      { time: "10:00", title: "Seaborn" },
      { time: "16:00", title: "Best Practices" }
    ]
  }
};

// ========== BADGES ==========
const badges = {
  "first-lesson": {
    badgeName: "First Lesson",
    badgeDesc: "Completed your first lesson",
    badgeIcon: "BookOpen",
    badgeCriteria: { type: "lessons_completed", count: 1 }
  },
  "3-day-streak": {
    badgeName: "3 Day Streak",
    badgeDesc: "Maintained a 3 day login streak",
    badgeIcon: "Flame",
    badgeCriteria: { type: "streak", count: 3 }
  },
  "perfect-score": {
    badgeName: "Perfect Score",
    badgeDesc: "Got 100% accuracy in a game round",
    badgeIcon: "CheckCircle2",
    badgeCriteria: { type: "perfect_game", count: 1 }
  },
  "top-10": {
    badgeName: "Top 10",
    badgeDesc: "Reached top 10 on the leaderboard",
    badgeIcon: "Trophy",
    badgeCriteria: { type: "leaderboard_rank", maxRank: 10 }
  },
  "speed-demon": {
    badgeName: "Speed Demon",
    badgeDesc: "Finished a game in under 1 minute",
    badgeIcon: "Zap",
    badgeCriteria: { type: "game_time", maxSeconds: 60 }
  },
  "week-warrior": {
    badgeName: "Week Warrior",
    badgeDesc: "Achieved a 7 day streak",
    badgeIcon: "Sword",
    badgeCriteria: { type: "streak", count: 7 }
  }
};

// ========== GAMES ==========
const games = {
  spaceship: {
    gameName: "Spaceship Mission",
    gameDesc: "Navigate through asteroid fields of code questions. Each correct answer fuels your ship further.",
    gameRoute: "/games/spaceship",
    maxScore: 1000,
    questionTopic: "python-basics"
  },
  subway: {
    gameName: "Subway Runner",
    gameDesc: "Race through challenges at speed. Dodge wrong answers and keep your streak alive.",
    gameRoute: "/games/subway",
    maxScore: 1000,
    questionTopic: "python-basics"
  },
  balloon: {
    gameName: "Balloon Shooter",
    gameDesc: "Pop the balloons carrying right answers before time runs out. Precision earns bonus.",
    gameRoute: "/games/balloon",
    maxScore: 1000,
    questionTopic: "python-basics"
  },
  "cat-rescue": {
    gameName: "Cat Rescue",
    gameDesc: "Save stranded cats by solving puzzles. Each correct answer builds a rescue bridge.",
    gameRoute: "/games/cat-rescue",
    maxScore: 1000,
    questionTopic: "python-basics"
  }
};

// ========== SEED FUNCTION ==========
async function seed() {
  console.log("🌱 Starting Firestore seed...\n");

  // Seed Courses
  for (const [id, data] of Object.entries(courses)) {
    await setDoc(doc(db, "courses", id), data);
    console.log(`  ✅ Course: ${id}`);
  }

  // Seed Lessons
  for (const [id, data] of Object.entries(lessons)) {
    await setDoc(doc(db, "lessons", id), data);
    console.log(`  ✅ Lesson: ${id}`);
  }

  // Seed Badges
  for (const [id, data] of Object.entries(badges)) {
    await setDoc(doc(db, "badges", id), data);
    console.log(`  ✅ Badge: ${id}`);
  }

  // Seed Games
  for (const [id, data] of Object.entries(games)) {
    await setDoc(doc(db, "games", id), data);
    console.log(`  ✅ Game: ${id}`);
  }

  console.log("\n🎉 Seed complete! All collections populated.");
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
