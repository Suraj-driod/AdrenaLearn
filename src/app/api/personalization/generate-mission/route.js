import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { db } from '@/backend/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { buildMissionPrompt } from '@/backend/personalizationService';

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

    const result = await model.generateContent(prompt);
    let aiResponse = result.response.text();

    // 6. Clean and Parse JSON
    aiResponse = aiResponse.replace(/```json/g, "").replace(/```/g, "").trim();
    const missionArray = JSON.parse(aiResponse);

    if (!Array.isArray(missionArray) || missionArray.length !== 4) {
      throw new Error("AI failed to output exactly 4 valid challenges.");
    }

    // 7. Save to Firestore
    console.log("Saving new custom mission to Firestore...");
    const missionId = `mission_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    const missionRef = doc(db, `users/${uid}/customMissions`, missionId);

    await setDoc(missionRef, {
      id: missionId,
      filename: file.name,
      challenges: missionArray,
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
