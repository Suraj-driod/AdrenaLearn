import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function POST(req) {
  try {
    const { question, code } = await req.json();

    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      systemInstruction: `You are "Kode Sensei", a friendly AI coding assistant.
The user is trying to solve a coding challenge in a gamified learning platform but got it wrong.

Your task:
1. Provide a short, constructive hint to guide them toward the correct solution.
2. DO NOT provide the exact code or the direct answer. Just nudge them in the right direction.
3. Keep it brief (1-3 sentences maximum).
4. Address the user directly in a friendly, encouraging tone.

Wait, do not use markdown code blocks if the user is a beginner, just explain concept simply.`
    });

    const prompt = `Challenge Question: ${question}

User's current code:
${code || "None"}

Please give me a small hint.`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    return NextResponse.json({ hint: responseText });

  } catch (error) {
    console.error('Gemini API Hint Error:', error);
    return NextResponse.json(
      { error: 'Failed to generate a hint.' }, 
      { status: 500 }
    );
  }
}
