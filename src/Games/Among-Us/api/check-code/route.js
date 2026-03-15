export async function POST(req) {
  try {
    const { code, question } = await req.json();
    console.log("Is my API key loaded?:", process.env.GROQ_API_KEY ? "YES ✅" : "NO ❌");
    console.log("Question:", question);

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
              content: `You are a ruthless, automated Python code grader. Your ONLY job is to check if the user's code correctly solves the given task.

              THE TASK THE USER MUST SOLVE:
              "${question || 'Write a function that adds two numbers'}"

              RULES:
              - If the code correctly solves the above task, output exactly: true
              - If the code is wrong, is random text, is empty, or does not solve the task, output exactly: false
              - DO NOT output anything else. No markdown, no explanations, no punctuation.
              - Just the single word: true or false`
            },
            {
              role: "user",
              content: `Input: ${code}\nOutput:`
            }
          ]
        })
      }
    );

    // Check status BEFORE parsing JSON
    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ Groq API Error:", errorText);
      return Response.json(
        { error: "Groq API failed", details: errorText },
        { status: response.status }
      );
    }

    const result = await response.json();

    // Safely extract the response
    const content = result.choices?.[0]?.message?.content || "";
    
    // STRICT PARSING: Check for exact match
    const cleanContent = content.trim().toLowerCase();
    const correct = cleanContent === "true";

    console.log(`🧠 AI Evaluation -> Raw: "${content}" | Graded As: ${correct}`);

    return Response.json({ correct });

  } catch (error) {
    console.error("❌ Backend crash:", error);
    return Response.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}