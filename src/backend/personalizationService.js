/**
 * personalizationService.js
 * 
 * A dedicated backend module that abstracts and manages the complex System Prompts
 * sent to Gemini/OpenAI for the Custom AI Missions feature.
 */

// Define the schema required by the Kat-Mage game engine
const MISSION_SCHEMA = `[
  {
    "narrative": "A dramatic 1 sentence RPG story integrating the concept.",
    "instruction": "Short instruction (e.g. 'Fix the logic to defeat the boss'.)",
    "question": "The actual coding prompt instruction."
  }
]`;

// Define the schema required by Precision Pop (Balloon Shooter) engine
const BALLOON_SCHEMA = `[
  {
    "question": "A concise multiple-choice question based on the text.",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correct": "Exactly one of the options above"
  }
]`;

/**
 * Builds the strict instruction prompt for Gemini to generate
 * custom coding challenges from the user's PDF textbook.
 * 
 * @param {string} rawText The parsed PDF text (truncated).
 * @returns {string} The fully orchestrated prompt for the LLM.
 */
export function buildMissionPrompt(rawText) {
  return `You are a game designer for an educational RPG.
I have extracted text from a user's study material (PDF syllabus or slide deck).
I need you to generate exactly 4 distinct, engaging programming challenges based directly on the concepts found in the text.

The text is:
"""
${rawText}
"""

Rules:
1. Generate exactly 4 challenges.
2. The challenges must relate to the text above.
3. Keep the actual coding questions ("question" field) short and strictly concise. A maximum of 3 lines. 
4. DO NOT make massive, multi-step word problems. Maintain simple logic tests.
5. Make the challenges language-agnostic unless the text explicitly mandates a specific language.
6. Return ONLY a pure JSON array containing the 4 challenges in this exact format. Do not use markdown backticks like \`\`\`json. 

Schema Format:
${MISSION_SCHEMA}`;
}

/**
 * Builds the strict instruction prompt for Gemini to generate
 * multiple-choice questions (MCQs) for Precision Pop / Balloon Shooter.
 *
 * @param {string} rawText The parsed PDF text (truncated).
 * @returns {string} The fully orchestrated prompt for the LLM.
 */
export function buildBalloonPrompt(rawText) {
  return `You are a game designer creating fast-paced multiple choice questions for a reflex-based game.
I have extracted text from a user's study material (PDF syllabus or slide deck).
I need you to generate exactly 8 multiple-choice questions based directly on the concepts found in the text.

The text is:
"""
${rawText}
"""

Rules:
1. Generate exactly 8 questions.
2. Each question must have exactly 4 options (strings) and exactly 1 correct answer.
3. The "correct" field MUST exactly match one of the option strings.
4. Keep questions short and crisp (1-2 lines).
5. Avoid trick questions; prioritize clarity.
6. Return ONLY a pure JSON array in this exact schema. Do not use markdown backticks like \`\`\`json.

Schema Format:
${BALLOON_SCHEMA}`;
}

/**
 * Builds the system prompt required to have Groq grade a student's
 * code snippet against an AI-generated custom question.
 * 
 * @param {string} question The dynamically generated question prompt.
 * @returns {string} The evaluation system prompt payload.
 */
export function buildEvaluationSystemPrompt(question) {
  return `You are a ruthless, automated code grader evaluating programming code. Your ONLY job is to check if the user's code correctly solves the given task.

THE TASK: ${question}

RULES:
- If the code correctly solves the task described above, output exactly: true
- If the code is wrong, is random text, is empty, or doesn't solve the task, output exactly: false
- DO NOT output anything else. No markdown, no explanations.
- Be lenient with minor syntax issues but strict on logic.

EXAMPLES:
If task is "adds two numbers":
Input: function add(a, b) { return a + b; }
Output: true

Input: print("hello");
Output: false`;
}
