import { NextResponse } from 'next/server';
import { buildEvaluationSystemPrompt } from '@/backend/personalizationService';

export async function POST(req) {
  try {
    const { code, question } = await req.json();

    if (!code || !question) {
      return NextResponse.json({ error: 'Missing code or question.' }, { status: 400 });
    }

    const GROQ_API_KEY = process.env.GROQ_API_KEY;
    if (!GROQ_API_KEY) {
      return NextResponse.json({ error: 'Server configuration missing Groq API key.' }, { status: 500 });
    }

    const systemPrompt = buildEvaluationSystemPrompt(question);

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        temperature: 0,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Input: ${code.replace(/\\n/g, '\n')}\nOutput:` }
        ]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ Groq API Error:", errorText);
      return NextResponse.json({ error: "Groq API failed", details: errorText }, { status: response.status });
    }

    const result = await response.json();
    const content = result.choices?.[0]?.message?.content || "";
    
    // Mirror check-code EXACTLY
    const cleanContent = content.trim().toLowerCase();
    const correct = cleanContent === "true";

    console.log(`🧠 AI Evaluation (Custom) -> Raw: "${content}" | Task: "${question}" | Graded As: ${correct}`);

    return NextResponse.json({ correct });

  } catch (error) {
    console.error("Personalization Grader Error:", error);
    return NextResponse.json({ error: error.message || "Internal server error." }, { status: 500 });
  }
}
