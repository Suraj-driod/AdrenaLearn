import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { db } from '@/backend/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { buildLessonBalloonPrompt } from '@/backend/personalizationService';

const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

export async function POST(req) {
  try {
    const { lessonId } = await req.json();

    if (!lessonId) {
      return NextResponse.json(
        { error: 'Missing lessonId.' },
        { status: 400 }
      );
    }

    // 1. Check cache first
    const cacheRef = doc(db, 'lessonQuestions', lessonId);
    const cacheSnap = await getDoc(cacheRef);

    if (cacheSnap.exists()) {
      const cached = cacheSnap.data();
      const age = Date.now() - (cached.generatedAt || 0);
      if (age < CACHE_TTL_MS && Array.isArray(cached.questions) && cached.questions.length > 0) {
        return NextResponse.json({ questions: cached.questions, cached: true });
      }
    }

    // 2. Fetch lesson metadata from Firestore
    const lessonSnap = await getDoc(doc(db, 'lessons', lessonId));
    if (!lessonSnap.exists()) {
      return NextResponse.json(
        { error: 'Lesson not found.' },
        { status: 404 }
      );
    }

    const lessonData = lessonSnap.data();

    // 3. Generate questions via Gemini
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const prompt = buildLessonBalloonPrompt(lessonData);
    const result = await model.generateContent(prompt);
    let responseText = result.response.text();

    // 4. Clean and parse JSON
    responseText = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
    const questions = JSON.parse(responseText);

    // 5. Validate
    if (!Array.isArray(questions) || questions.length < 1) {
      throw new Error('AI returned invalid question array.');
    }

    for (const q of questions) {
      if (!q || typeof q.question !== 'string') {
        throw new Error("Question missing 'question' string.");
      }
      if (!Array.isArray(q.options) || q.options.length !== 4) {
        throw new Error('Each question must have exactly 4 options.');
      }
      if (typeof q.correct !== 'string' || !q.options.includes(q.correct)) {
        throw new Error("'correct' must exactly match one of the options.");
      }
    }

    // 6. Cache to Firestore
    await setDoc(cacheRef, {
      lessonId,
      questions,
      generatedAt: Date.now(),
    });

    return NextResponse.json({ questions, cached: false });
  } catch (error) {
    console.error('Balloon Questions API Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate questions.' },
      { status: 500 }
    );
  }
}
