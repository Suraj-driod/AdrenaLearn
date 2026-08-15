import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function POST(req) {
  try {
    const { messages, currentQ, totalQ, topic } = await req.json();
    const cleanTopic = topic || 'Computer Science';

    const model = genAI.getGenerativeModel({
      model: 'gemini-3.5-flash-lite',
      systemInstruction: `You are "Kode Sensei", a friendly, encouraging, but rigorous AI technical interviewer on AdrenaLearn. 
The user is participating in a technical interview specifically focused on the topic: "${cleanTopic}". Currently on question ${currentQ} of ${totalQ}.

Your job is to:
1. STRICTLY evaluate the user's latest answer for correctness and understanding of "${cleanTopic}". Mark "isCorrect": true if their answer demonstrates accurate technical/conceptual understanding. Mark "isCorrect": false if incorrect or evasive.
2. Provide brief constructive feedback (1-2 sentences): validate their key points, or gently correct misconceptions.
3. If currentQ < totalQ: You MUST ask the NEXT interview question at the end of your reply. The question MUST be strictly relevant to "${cleanTopic}" (testing fundamental concepts, mechanisms, trade-offs, or real-world behavior).
4. If currentQ == totalQ: Do NOT ask another question. Instead, summarize their performance gracefully and congratulate them.

You MUST respond ONLY with a valid JSON object in this exact format:
{
  "reply": "Your feedback on their answer, followed immediately by the next question on ${cleanTopic} (or final summary if last question)...",
  "isCorrect": true or false,
  "pointsAwarded": 3 (if correct) or 0 (if incorrect)
}`,
      generationConfig: { responseMimeType: "application/json" } 
    });

    // Format the frontend messages ('student'/'sensei') to Gemini's format ('user'/'model')
    let chatHistory = messages.map((msg) => ({
      role: msg.role === 'student' ? 'user' : 'model',
      parts: [{ text: msg.text }],
    }));

    // If the history starts with Sensei ('model'), prepend a secret dummy 'user' message
    if (chatHistory.length > 0 && chatHistory[0].role === 'model') {
      chatHistory.unshift({
        role: 'user',
        parts: [{ text: `Hello Sensei, I am ready to begin the quiz on ${cleanTopic}!` }]
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
    console.error('Gemini Interview API Error:', error);
    return NextResponse.json(
      { error: 'Failed to process the interview.' }, 
      { status: 500 }
    );
  }
}