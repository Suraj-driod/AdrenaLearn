import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function POST(req) {
  try {
    const { messages, currentQ, totalQ } = await req.json();

    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      systemInstruction:`You are "Kode Sensei", a friendly but rigorous AI technical interviewer. 
The user is participating in a software engineering mock interview. Currently on question ${currentQ} of ${totalQ}.

Your job is to:
1. STRICTLY evaluate the user's latest answer. Be objective and unbiased. ONLY mark "isCorrect": true if the answer demonstrates a clear, accurate, and technically sound understanding of the concept. Do not give credit for overly vague, evasive, or entirely incorrect answers.
2. Provide constructive feedback in your reply: briefly validate their accurate points, or gently correct their misconceptions if they were wrong.
3. If currentQ < totalQ, you MUST ask the next interview question at the very end of your reply. The questions should cover standard software engineering topics (e.g., data structures, algorithms, web fundamentals, system design, or core computer science concepts). 
4. If currentQ == totalQ, do not ask another question. Instead, wrap up the interview gracefully and summarize their overall performance.

You MUST respond ONLY with a valid JSON object in this exact format:
{
  "reply": "Your feedback on their answer, followed immediately by the next interview question...",
  "isCorrect": true or false,
  "pointsAwarded": 3 (if correct) or 0 (if incorrect)
}` ,
      generationConfig: { responseMimeType: "application/json" } 
    });

    // Format the frontend messages ('student'/'sensei') to Gemini's format ('user'/'model')
    let chatHistory = messages.map((msg) => ({
      role: msg.role === 'student' ? 'user' : 'model',
      parts: [{ text: msg.text }],
    }));

    // === THE FIX IS HERE ===
    // If the history starts with Sensei ('model'), prepend a secret dummy 'user' message
    if (chatHistory.length > 0 && chatHistory[0].role === 'model') {
      chatHistory.unshift({
        role: 'user',
        parts: [{ text: "Hello Sensei, I am ready to begin the quiz!" }]
      });
    }

    // Pull off the last message to send as the actual prompt, use the rest as history
    const history = chatHistory.slice(0, -1);
    const latestMessage = chatHistory[chatHistory.length - 1].parts[0].text;

    const chat = model.startChat({ history });
    const result = await chat.sendMessage(latestMessage);
    const responseText = result.response.text();

    const parsedResponse = JSON.parse(responseText);

    return NextResponse.json(parsedResponse);

  } catch (error) {
    console.error('Gemini API Error:', error);
    return NextResponse.json(
      { error: 'Failed to process the interview.' }, 
      { status: 500 }
    );
  }
}