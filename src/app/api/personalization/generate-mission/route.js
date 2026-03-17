import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { db } from '@/backend/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { buildBalloonPrompt, buildMissionPrompt } from '@/backend/personalizationService';

export const maxDuration = 60; // Set Vercel max execution time (if applicable)

export async function POST(req) {
  try {
    const formData = await req.formData();
    const file = formData.get('file');
    const uid = formData.get('uid');

    if (!file || !uid) {
      return NextResponse.json({ error: 'Missing file or user authentication.' }, { status: 400 });
    }

    const API_KEY = process.env.PDF_CO_API_KEY;
    if (!API_KEY) {
      return NextResponse.json({ error: 'Server configuration missing PDF.co API key.' }, { status: 500 });
    }

    // 1. Get Presigned Upload URL from PDF.co
    console.log("Requesting presigned URL from PDF.co...");
    const presignReq = await fetch(`https://api.pdf.co/v1/file/upload/get-presigned-url?name=${encodeURIComponent(file.name)}&encrypt=true`, {
      method: "GET",
      headers: { "x-api-key": API_KEY }
    });

    const presignData = await presignReq.json();
    if (presignData.error) {
      throw new Error(presignData.message);
    }
    const presignedUrl = presignData.presignedUrl;
    const uploadedFileUrl = presignData.url;

    // 2. Upload the ArrayBuffer directly to the presigned URL
    console.log("Uploading file to secure temporary storage...");
    const buffer = await file.arrayBuffer();
    await fetch(presignedUrl, {
      method: "PUT",
      headers: {
        "x-api-key": API_KEY,
        "content-type": "application/octet-stream"
      },
      body: buffer
    });

    // 3. Extract Text via PDF.co Convert endpoint
    console.log("Extracting text from PDF...");
    const extractReq = await fetch('https://api.pdf.co/v1/pdf/convert/to/text', {
      method: "POST",
      headers: {
        "x-api-key": API_KEY,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        url: uploadedFileUrl,
        inline: true
      })
    });
    const extractData = await extractReq.json();
    if (extractData.error || !extractData.body) {
      throw new Error(extractData.message || "Failed to extract text from the PDF.");
    }

    // 4. Truncate extracted text for LLM Context Window
    let rawText = extractData.body;
    rawText = rawText.substring(0, 15000);

    // 5. Orchestrate the Gemini parsing
    console.log("Instructing Gemini AI to build custom coding mission...");
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = buildMissionPrompt(rawText);
    const balloonPrompt = buildBalloonPrompt(rawText);

    const [katResult, balloonResult] = await Promise.all([
      model.generateContent(prompt),
      model.generateContent(balloonPrompt),
    ]);

    // 6. Clean and Parse JSON
    let katResponse = katResult.response.text();
    katResponse = katResponse.replace(/```json/g, "").replace(/```/g, "").trim();
    const missionArray = JSON.parse(katResponse);

    let balloonResponse = balloonResult.response.text();
    balloonResponse = balloonResponse.replace(/```json/g, "").replace(/```/g, "").trim();
    const balloonQuestions = JSON.parse(balloonResponse);

    if (!Array.isArray(missionArray) || missionArray.length !== 4) {
      throw new Error("AI failed to output exactly 4 valid challenges.");
    }
    if (!Array.isArray(balloonQuestions) || balloonQuestions.length !== 8) {
      throw new Error("AI failed to output exactly 8 valid balloon questions.");
    }
    for (const q of balloonQuestions) {
      if (!q || typeof q.question !== 'string') throw new Error("Balloon question missing 'question' string.");
      if (!Array.isArray(q.options) || q.options.length !== 4) throw new Error("Balloon question must have exactly 4 options.");
      if (typeof q.correct !== 'string' || !q.options.includes(q.correct)) {
        throw new Error("Balloon question 'correct' must exactly match one of the options.");
      }
    }

    // 7. Save to Firestore
    console.log("Saving new custom mission to Firestore...");
    const missionId = `mission_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    const missionRef = doc(db, `users/${uid}/customMissions`, missionId);

    await setDoc(missionRef, {
      id: missionId,
      filename: file.name,
      challenges: missionArray,
      balloonQuestions,
      createdAt: new Date().toISOString()
    });

    console.log("Mission successfully forged!");
    // Return the missionId to the client
    return NextResponse.json({ success: true, missionId });

  } catch (error) {
    console.error("Personalization Forge Error:", error);
    return NextResponse.json({ error: error.message || "Internal server error." }, { status: 500 });
  }
}
