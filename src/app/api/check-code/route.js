import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function POST(req) {
  try {
    const { code, question, topic } = await req.json();

    if (!code || typeof code !== 'string' || !code.trim()) {
      return Response.json({ correct: false, reason: 'Empty submission' });
    }

    const taskTopic = topic || 'Computer Science';
    const taskDescription = question || 'Solve the given task';
    const cleanSubmission = code.trim();

    // Use Gemini 3.5 Flash-Lite to grade both code and conceptual text explanations
    try {
      const model = genAI.getGenerativeModel({
        model: 'gemini-3.5-flash-lite',
        generationConfig: {
          responseMimeType: 'application/json',
        },
        systemInstruction: `You are an intelligent, fair automated evaluator for educational game challenges on AdrenaLearn.
Your ONLY job is to evaluate if the user's submitted code or written answer correctly addresses the challenge for the topic: "${taskTopic}".

THE CHALLENGE:
"${taskDescription}"

EVALUATION RULES:
1. If the challenge asks for CODE (e.g. Python function, loop, statement):
   - Check if the code logically solves the task.
   - Be forgiving of small typos or missing comments, but require valid logic.
2. If the challenge asks for a TEXT/CONCEPTUAL EXPLANATION:
   - Check if the explanation is accurate, relevant, and captures the core concept.
   - Do NOT expect code; accept natural conversational or factual explanations.
3. Mark "correct": true if the answer demonstrates correct understanding or working code.
4. Mark "correct": false only if the answer is completely wrong, irrelevant, gibberish, or empty.

You MUST respond strictly with JSON:
{
  "correct": true or false,
  "feedback": "1 short sentence of feedback"
}`,
      });

      const prompt = `User Submission:\n"""\n${cleanSubmission}\n"""`;
      const result = await model.generateContent(prompt);
      const responseText = result.response.text();

      let cleanText = responseText.trim();
      if (cleanText.startsWith('```json')) {
        cleanText = cleanText.replace(/^```json\s*/, '').replace(/```\s*$/, '');
      } else if (cleanText.startsWith('```')) {
        cleanText = cleanText.replace(/^```\s*/, '').replace(/```\s*$/, '');
      }

      const parsed = JSON.parse(cleanText);
      return Response.json({ correct: Boolean(parsed.correct) });

    } catch (aiErr) {
      console.warn('Gemini evaluate fallback to Groq or heuristic:', aiErr);

      // Groq fallback if configured
      if (process.env.GROQ_API_KEY) {
        const response = await fetch(
          "https://api.groq.com/openai/v1/chat/completions",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${process.env.GROQ_API_KEY}`
            },
            body: JSON.stringify({
              model: "llama-3.3-70b-versatile",
              temperature: 0,
              messages: [
                {
                  role: "system",
                  content: `You are an automated grader. Check if user's submission correctly answers the challenge: "${taskDescription}" for topic "${taskTopic}". Output exactly: true or false.`
                },
                {
                  role: "user",
                  content: cleanSubmission
                }
              ]
            })
          }
        );

        if (response.ok) {
          const resJson = await response.json();
          const content = resJson.choices?.[0]?.message?.content || "";
          return Response.json({ correct: content.trim().toLowerCase().includes("true") });
        }
      }

      // Simple heuristic if all else fails
      const hasLength = cleanSubmission.length > 5;
      return Response.json({ correct: hasLength });
    }

  } catch (error) {
    console.error('❌ Check-code crash:', error);
    return Response.json(
      { error: 'Internal Server Error', correct: false },
      { status: 500 }
    );
  }
}
