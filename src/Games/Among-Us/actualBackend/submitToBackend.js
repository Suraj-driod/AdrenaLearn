export default async function handleCodeSubmit(code) {
  try {
    const res = await fetch("/api/check-code", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code })
    });

    if (!res.ok) {
      console.error(`Server failed with status: ${res.status}`);
      return false; // ← just return, don't dispatch
    }

    const text = await res.text();
    if (!text) {
      console.error("Server returned empty string.");
      return false;
    }

    const data = JSON.parse(text);
    return data.correct === true; // ← return true/false only

  } catch (error) {
    console.error("Submission error:", error);
    return false;
  }
}