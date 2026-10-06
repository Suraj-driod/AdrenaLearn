import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';
import { getWebDataForQuery } from '../../serp-api/serpService';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function POST(req) {
  try {
    const { topic, definition, animation, webContext } = await req.json();

    if (!topic || typeof topic !== 'string' || !topic.trim()) {
      return NextResponse.json(
        { error: 'Topic is required to generate game data.' },
        { status: 400 }
      );
    }

    const cleanTopic = topic.trim();
    const cleanDefinition = typeof definition === 'string' ? definition.trim() : '';

    let activeWebContext = typeof webContext === 'string' ? webContext.trim() : '';

    // If webContext was not provided, check if we should fetch it for newer concepts
    if (!activeWebContext) {
      try {
        const webData = await getWebDataForQuery(cleanTopic);
        if (webData.hasWebData) {
          activeWebContext = webData.scannedContext;
        }
      } catch (err) {
        console.warn('Fallback web context fetch error in generate-game-data:', err);
      }
    }

    const webContextInstruction = activeWebContext
      ? `

LIVE SCANNED WEB DATA (From verified websites for ${cleanTopic}):
${activeWebContext}
CRITICAL REQUIREMENT:
Base all questions, challenges, and trivias strictly on the facts and information in the scanned web data above. Ensure all technical details and concepts are 100% accurate and up-to-date without hallucinations.`
      : '';

    const model = genAI.getGenerativeModel({
      model: 'gemini-3.5-flash-lite',
      generationConfig: {
        responseMimeType: 'application/json',
      },
      systemInstruction: `You are a friendly, creative curriculum designer for educational games on AdrenaLearn.
Your goal is to generate simple, engaging, easy-to-understand game questions and challenges in PLAIN, beginner-friendly English (no dense academic jargon).${webContextInstruction}

You MUST respond strictly with a valid JSON object matching this schema:
{
  "topic": "${cleanTopic}",
  "isCodeRelated": true or false (true if the topic is programming, coding, algorithms, syntax, data structures in code; false if it is conceptual, hardware, physics, or general science like magnets/mitosis),
  "balloonQuestions": [
    // Provide exactly 8 high-quality multiple choice questions in simple, plain English based DIRECTLY on the topic
    {
      "question": "Clear, simple question testing knowledge of ${cleanTopic}",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correct": "Exact string matching one of the options above"
    }
  ],
  "challenges": [
    // Provide exactly 4 progressive in-game level challenges
    {
      "id": "1",
      "question": "If isCodeRelated is true: a simple coding task. If isCodeRelated is false: a simple 1-2 sentence explanation prompt.",
      "type": "code" or "text",
      "narrative": "A mysterious barrier blocks your path.",
      "instruction": "Solve the challenge to proceed."
    },
    {
      "id": "2",
      "question": "Second challenge on ${cleanTopic} in simple terms",
      "type": "code" or "text",
      "narrative": "The security terminal requests verification.",
      "instruction": "Enter your solution."
    },
    {
      "id": "3",
      "question": "Third deeper challenge on ${cleanTopic} in simple terms",
      "type": "code" or "text",
      "narrative": "Spikes emerge from the floor ahead.",
      "instruction": "Answer to desummon the hazard."
    },
    {
      "id": "4",
      "question": "Fourth mastery challenge on ${cleanTopic} in simple terms",
      "type": "code" or "text",
      "narrative": "The master gateway requires final authorization.",
      "instruction": "Provide the final answer."
    }
  ],
  "trivias": [
    // Exactly 4 concise, fascinating, easy-to-read facts specifically about ${cleanTopic} (1 sentence each)
    "Interesting, simple fact 1 specifically about ${cleanTopic}.",
    "Interesting, simple fact 2 specifically about ${cleanTopic}.",
    "Interesting, simple fact 3 specifically about ${cleanTopic}.",
    "Interesting, simple fact 4 specifically about ${cleanTopic}."
  ],
  "emergencyMCQ": {
    "question": "A fast sabotage emergency question about ${cleanTopic} in simple words?",
    "options": ["Option 1", "Option 2", "Option 3"],
    "correct": "Exact string matching one of the 3 options"
  },
  "interviewStarter": "A friendly, conversational 1-2 sentence greeting from Kode Sensei congratulating the player, followed by a simple first interview question about ${cleanTopic}."
}

RULES:
- Use simple, everyday, accessible language. Avoid overly dense textbook jargon.
- Every balloon question MUST have exactly 4 options with exact 'correct' match.
- If isCodeRelated is false, challenges MUST be answerable with normal text explanations (1-2 simple sentences), NOT code.
- If isCodeRelated is true, challenges MUST be simple Python tasks.`,
    });

    const prompt = `Topic: "${cleanTopic}"
Definition / Concept: "${cleanDefinition}"
Generate simple, beginner-friendly game questions, challenges, and dynamic trivia facts in plain English based on the verified information.`;

    let parsedData;
    try {
      const result = await model.generateContent(prompt);
      const responseText = result.response.text();
      let cleanText = responseText.trim();
      if (cleanText.startsWith('```json')) {
        cleanText = cleanText.replace(/^```json\s*/, '').replace(/```\s*$/, '');
      } else if (cleanText.startsWith('```')) {
        cleanText = cleanText.replace(/^```\s*/, '').replace(/```\s*$/, '');
      }
      parsedData = JSON.parse(cleanText);
    } catch (genErr) {
      console.warn('Game Data AI generation fallback triggered:', genErr);
      const isCode = /code|python|function|variable|loop|algorithm|array|class|recursion/i.test(cleanTopic);
      parsedData = {
        topic: cleanTopic,
        isCodeRelated: isCode,
        balloonQuestions: [
          {
            question: `What is the main purpose of ${cleanTopic}?`,
            options: [
              `To organize and process things efficiently`,
              `To delete all stored data randomly`,
              `To stop programs from executing`,
              `To slow down the computer`,
            ],
            correct: `To organize and process things efficiently`,
          },
          {
            question: `Why do we use ${cleanTopic}?`,
            options: [
              `It makes solving problems faster and cleaner`,
              `It uses infinite memory unnecessarily`,
              `It is never used in real software`,
              `It makes tasks unpredictable`,
            ],
            correct: `It makes solving problems faster and cleaner`,
          },
          {
            question: `Where does ${cleanTopic} work best?`,
            options: [
              `In organized step-by-step systems`,
              `In completely broken programs`,
              `When no data exists at all`,
              `In disabled hardware`,
            ],
            correct: `In organized step-by-step systems`,
          },
          {
            question: `What is the biggest advantage of ${cleanTopic}?`,
            options: [
              `Clear structure and reliable results`,
              `Slower execution speed`,
              `More errors and confusion`,
              `Uncontrolled computer freezes`,
            ],
            correct: `Clear structure and reliable results`,
          },
        ],
        challenges: [
          {
            id: '1',
            question: isCode
              ? `Write a simple Python statement showing how ${cleanTopic} works.`
              : `Explain in 1 simple sentence what ${cleanTopic} does.`,
            type: isCode ? 'code' : 'text',
            narrative: 'A mysterious barrier blocks your path.',
            instruction: 'Answer to desummon the barrier.',
          },
          {
            id: '2',
            question: isCode
              ? `Write a basic function related to ${cleanTopic}.`
              : `What is one big benefit of using ${cleanTopic}?`,
            type: isCode ? 'code' : 'text',
            narrative: 'The terminal asks for verification.',
            instruction: 'Enter your solution.',
          },
          {
            id: '3',
            question: isCode
              ? `Implement a simple check for ${cleanTopic}.`
              : `What is the most important step in ${cleanTopic}?`,
            type: isCode ? 'code' : 'text',
            narrative: 'Spikes emerge from the floor ahead.',
            instruction: 'Answer to proceed.',
          },
          {
            id: '4',
            question: isCode
              ? `Complete the final task for ${cleanTopic}.`
              : `Summarize why ${cleanTopic} is helpful in everyday tech.`,
            type: isCode ? 'code' : 'text',
            narrative: 'The master gateway requires final authorization.',
            instruction: 'Provide the final answer.',
          },
        ],
        trivias: [
          `${cleanTopic} is used across many modern apps and websites.`,
          `Learning ${cleanTopic} makes building projects much easier.`,
          `${cleanTopic} keeps systems organized and predictable.`,
          `Mastering ${cleanTopic} is a great step in your learning journey!`
        ],
        emergencyMCQ: {
          question: `What is the main job of ${cleanTopic}?`,
          options: ["Organize and process tasks cleanly", "Crash the operating system", "Erase all files randomly"],
          correct: "Organize and process tasks cleanly"
        },
        interviewStarter: `Awesome work completing your mission on ${cleanTopic}! Let's do a quick friendly review. First question: In your own words, what is the main goal of ${cleanTopic}?`,
      };
    }

    return NextResponse.json(parsedData);
  } catch (error) {
    console.error('Generate Game Data API Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to generate game data.' },
      { status: 500 }
    );
  }
}
