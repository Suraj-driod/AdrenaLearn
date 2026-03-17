<div align="center">
  <h1>🎮 AdrenaLearn</h1>
  <p><b>Learn. Play. Conquer.</b></p>
  <p>An innovative, gamified e-learning platform that transforms programming education into an engaging adventure.</p>
</div>

---

## 🚀 The Problem & Our Solution
Learning to code can be tedious and intimidating. **AdrenaLearn** makes programming accessible, engaging, and fun by seamlessly blending interactive lessons, AI-powered tutoring, and actual gameplay. Students master core coding concepts through play, competition, and real-time feedback.

## ✨ Key Features
- **🤖 Built-in AI Tutor (Gemini):** Real-time, context-specific help and debugging assistance using Google Generative AI.
- **📝 In-Browser Coding:** Integrated Monaco code editor with instant test case validation.
- **🏆 Global Leaderboards:** Compete with friends and the global community in real-time.

## 🕹️ The Games
AdrenaLearn features three core games, each designed to teach specific programming skills:
1. **🔴 Among Us (Logic & Debugging):** Write logic to find the "imposter". Teaches conditional logic, boolean operators, and problem-solving.
2. **🧙‍♀️ Kat Mage (Story-Driven RPG):** Solve coding puzzles to progress the narrative. Teaches functions, arrays, and loops.
3. **🎈 Balloon Shooter (Reflexes & Syntax):** Fast-paced arcade action. Hitting balloons correctly executes code. Teaches pattern recognition and game loop concepts.

## 🛠️ Tech Stack
- **Frontend:** Next.js, React, Tailwind CSS, Framer Motion
- **Game Engine:** Phaser 3
- **Editor:** Monaco Editor
- **Backend & Database:** Next.js API Routes, Firebase (Auth & Firestore)
- **AI Integration:** Google Generative AI (Gemini)

## 🏎️ Quick Start

**1. Clone & Install**
```bash
git clone https://github.com/yourusername/AdrenaLearn.git
cd AdrenaLearn
npm install
```

**2. Environment Setup**
Create a `.env.local` file with your credentials:
```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_GOOGLE_GEMINI_API_KEY=your_gemini_key
```

**3. Run Development Server**
```bash
npm run dev
```
Explore the app at [http://localhost:3000](http://localhost:3000).

---
<div align="center">
  <i>Built with ❤️ for hackers, learners, and gamers.</i>
</div>