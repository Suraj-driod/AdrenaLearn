export default async function handleCodeSubmit(code) {
  try {
    // Read the current question and topic from the game state
    const question = window.currentAmongQuestion || "";
    const topic = window.currentGameTopic || "";

    const res = await fetch("/api/check-code", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code, question, topic })
    });

    if (!res.ok) {
      console.error(`Server failed with status: ${res.status}`);
      return false;
    }

    const text = await res.text();
    if (!text) {
      console.error("Server returned empty string.");
      return false;
    }

    const data = JSON.parse(text);
    return data.correct === true;

  } catch (error) {
    console.error("Submission error:", error);
    return false;
  }
}