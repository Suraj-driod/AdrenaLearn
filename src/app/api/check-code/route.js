export async function POST(req) {
  try {
    const { code } = await req.json();
    console.log("Is my API key loaded?:", process.env.GROQ_API_KEY ? "YES ✅" : "NO ❌");

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
              content: `You are a ruthless, automated code grader. Your ONLY job is to check if the user's code correctly adds two numbers.

              RULES:
              - If the code adds two numbers correctly, output exactly: true
              - If the code is wrong, is random text, is empty, or prints a string, output exactly: false
              - DO NOT output anything else. No markdown, no explanations.

              EXAMPLES:
              Input: function add(a, b) { return a + b; }
              Output: true

              Input: const sum = x + y;
              Output: true

              Input: console.log("hello");
              Output: false

              Input: asdf
              Output: false

              Input: function add(a, b) { return a - b; }
              Output: false`
            },
            {
              role: "user",
              content: `Input: ${code}\nOutput:`
            }
          ]
        })
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ Groq API Error:", errorText);
      return Response.json(
        { error: "Groq API failed", details: errorText },
        { status: response.status }
      );
    }

    const result = await response.json();

    const content = result.choices?.[0]?.message?.content || "";
    
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
