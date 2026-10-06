import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';
import { getWebDataForQuery } from '../serp-api/serpService';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function POST(req) {
  try {
    const { query, interests } = await req.json();

    if (!query || typeof query !== 'string' || !query.trim()) {
      return NextResponse.json(
        { error: 'Search query is required.' },
        { status: 400 }
      );
    }

    const trimmedQuery = query.trim();
    const trimmedInterests = typeof interests === 'string' ? interests.trim() : '';

    const personalizationInstruction = trimmedInterests
      ? `

USER PERSONALIZATION & INTERESTS:
The user has declared their favorite interest / sport / movie / hobby: "${trimmedInterests}".
IMPORTANT INSTRUCTION:
1. Do NOT put the hobby or interest in the "animation" (diagram/simulation). The animation MUST remain a clean, standard, simple technical representation.
2. Instead, generate a dedicated "personalizedExample" object explaining the searched topic through the lens and language of "${trimmedInterests}" in very simple, fun, relatable words.`
      : `
If no interest is provided, set "personalizedExample" to null.`;

    const commonSchemaInstruction = `You MUST respond strictly with a valid JSON object matching this schema:
{
  "needsSearch": false,
  "definition": "Exactly ONE simple, crystal-clear sentence defining the topic in easy everyday words (what it is and how it works in plain English).",
  "animation": {
    // Choose EXACTLY ONE of: "connectors", "orbiter", "animatedlist", "network", or "dotmultiplier"
    "type": "connectors" | "orbiter" | "animatedlist" | "network" | "dotmultiplier",
    "title": "Short, friendly title",
    "description": "Simple 1-line summary in plain English",
    ...type specific fields as specified below...
  },
  "hasInteractive": true or false,
  "interactiveHtml": "<!DOCTYPE html><html>...interactive try-it-yourself sandbox...</html>" or null,
  "personalizedExample": ${trimmedInterests ? `{
    "interest": "${trimmedInterests}",
    "analogyTitle": "Simple Analogy Title (e.g., How ${trimmedQuery} is like ${trimmedInterests})",
    "analogyText": "A fun, simple 2-3 sentence explanation connecting the topic directly to ${trimmedInterests} using easy everyday terms."
  }` : `null`}
}

CRITICAL RULES FOR SIMPLICITY & LANGUAGE:
1. TONE & VOCABULARY:
   - Use simple, active, conversational everyday words.
   - AVOID dense academic jargon, cryptic buzzwords, or textbook phrases.
   - If a technical term is essential, explain it simply on the spot.

2. RULES FOR "definition":
   - Exactly ONE clear, direct sentence.
   - Explain *what it is* and *the core idea of how it works* so anyone understands on first read.
   - No introductory filler (do NOT say "In computer science..." or "Sure!").

3. RULES FOR COMPONENT DESCRIPTIONS:
   - Every node, plate, satellite, and branch description must be 1 short, plain-English sentence explaining its role simply and clearly.

4. RULES FOR "animation.type":
Choose the best suited template for the topic:
1. "connectors" -> For mind maps, hierarchies, step-by-step chains, or concept trees.
2. "orbiter" -> For things revolving around a central core hub.
3. "animatedlist" -> For Stack (LIFO), Queue (FIFO), or Priority Queue.
4. "network" -> For networks, distributed systems, internet routes, client-server databases.
5. "dotmultiplier" -> For Cell multiplication, Mitosis, How magnets work, Gravity, Physics collisions, or multiplying blobs.

5. RULES FOR "hasInteractive" and "interactiveHtml":
- Set "hasInteractive" to true ONLY if the topic is an interactive simulation (e.g., Stack push/pop, Queue enqueue/dequeue, Binary Search player).
- For conceptual topics, set "hasInteractive" to false and "interactiveHtml" to null.
- If true, provide a clean, self-contained HTML5 dark sandbox with simple controls (e.g. Push, Pop, Enqueue, Dequeue, Step, Play).
- ABSOLUTELY REFRAIN from adding any "Reset", "Restart", "Clear", or "Replay" buttons inside the iframe HTML.`;

    const model = genAI.getGenerativeModel({
      model: 'gemini-3.5-flash-lite',
      generationConfig: {
        responseMimeType: 'application/json',
      },
      systemInstruction: `You are a friendly, world-class educator who specializes in explaining complex computer science, tech, and STEM concepts in SIMPLE, intuitive, easy-to-understand plain English (like explaining to a bright 10-year-old or beginner).
Your goal is to make every concept crystal clear and exciting, using simple words without dense textbook jargon or robotic academic language.${personalizationInstruction}

CRITICAL KNOWLEDGE BASE EVALUATION & SERPAPI SEARCH:
You are running as gemini-3.5-flash-lite. Your internal training knowledge base has a cutoff and you hallucinate if asked about newer technologies, modern frameworks, recent software updates, current AI models, or events post-cutoff.
If the query "${trimmedQuery}" is NOT firmly and reliably in your pre-trained knowledge base, or if there is ANY chance of hallucination or outdated knowledge:
You MUST request a SerpApi search by returning strictly:
{
  "needsSearch": true,
  "searchQuery": "${trimmedQuery}"
}

ONLY if you are 100% confident that "${trimmedQuery}" is an established, timeless, foundational concept in your knowledge base (such as classic Data Structures: Stack/Queue/Tree/Graph, classic Algorithms: Binary Search/Bubble Sort, foundational Physics/Biology/Math: Mitosis/Magnets/Gravity):
Respond with:
${commonSchemaInstruction}`,
    });

    const initialPrompt = trimmedInterests
      ? `Explain the topic: "${trimmedQuery}" using simple, beginner-friendly plain English. Create a standard visual diagram in "animation", and a separate simple real-world analogy in "personalizedExample" for interest: "${trimmedInterests}". If not in your verified knowledge base, request SerpApi search.`
      : `Explain the topic: "${trimmedQuery}" using simple, beginner-friendly plain English. If not in your verified knowledge base, request SerpApi search.`;

    let parsedData = null;
    let webData = null;

    try {
      const result = await model.generateContent(initialPrompt);
      const responseText = result.response.text();
      let cleanText = responseText.trim();
      if (cleanText.startsWith('```json')) {
        cleanText = cleanText.replace(/^```json\s*/, '').replace(/```\s*$/, '');
      } else if (cleanText.startsWith('```')) {
        cleanText = cleanText.replace(/^```\s*/, '').replace(/```\s*$/, '');
      }
      parsedData = JSON.parse(cleanText);
    } catch (initialErr) {
      console.warn('Initial knowledge check parsing error:', initialErr);
    }

    // If AI indicated it needs SerpApi search or if knowledge check flagged it
    if (!parsedData || parsedData.needsSearch === true) {
      const searchQuery = parsedData?.searchQuery || trimmedQuery;
      console.log(`[SearchRoute] Query "${trimmedQuery}" requires web search. Fetching SerpApi results...`);

      // 1. Fetch SerpApi links, filter out social links (instagram, youtube, facebook, reddit, X),
      // 2. Scan the first 3 website contents directly
      webData = await getWebDataForQuery(searchQuery);

      const webContextSnippet = webData.hasWebData
        ? `\n\nLIVE SCANNED WEB DATA (Retrieved from 3 websites via SerpApi for "${trimmedQuery}"):
${webData.scannedContext}

CRITICAL ACCURACY INSTRUCTION:
Use the 3 scanned websites' information above to explain "${trimmedQuery}".
Ground your definition, animation, and personalized example strictly in the facts from these 3 websites. Do NOT hallucinate.`
        : '';

      const groundedModel = genAI.getGenerativeModel({
        model: 'gemini-3.5-flash-lite',
        generationConfig: {
          responseMimeType: 'application/json',
        },
        systemInstruction: `You are a friendly, world-class educator who specializes in explaining complex computer science, tech, and STEM concepts in SIMPLE, intuitive, easy-to-understand plain English.${personalizationInstruction}
${webContextSnippet}

${commonSchemaInstruction}`,
      });

      const secondPrompt = trimmedInterests
        ? `Explain the topic: "${trimmedQuery}" based on the scanned live web information using simple, beginner-friendly plain English. Create a standard visual diagram in "animation", and a separate simple real-world analogy in "personalizedExample" for interest: "${trimmedInterests}".`
        : `Explain the topic: "${trimmedQuery}" based on the scanned live web information using simple, beginner-friendly plain English.`;

      try {
        const groundedResult = await groundedModel.generateContent(secondPrompt);
        let groundedText = groundedResult.response.text().trim();
        if (groundedText.startsWith('```json')) {
          groundedText = groundedText.replace(/^```json\s*/, '').replace(/```\s*$/, '');
        } else if (groundedText.startsWith('```')) {
          groundedText = groundedText.replace(/^```\s*/, '').replace(/```\s*$/, '');
        }
        parsedData = JSON.parse(groundedText);
      } catch (groundedErr) {
        console.warn('Grounded generation parsing error:', groundedErr);
      }
    }

    // Safety fallback if generation completely failed
    if (!parsedData || !parsedData.definition) {
      parsedData = {
        definition: `${trimmedQuery} is a modern concept that helps organize data and make systems work efficiently.`,
        animation: {
          type: 'connectors',
          pattern: 'mindmap',
          title: trimmedQuery,
          description: 'How It Works & Key Ideas',
          root: {
            id: 'root',
            label: trimmedQuery,
            subtitle: 'Core Concept',
            description: `The main idea behind ${trimmedQuery}.`,
          },
          branches: [
            { id: '1', label: 'How It Works', subtitle: 'Basic Steps', description: `The simple steps that make ${trimmedQuery} function.` },
            { id: '2', label: 'Key Parts', subtitle: 'Building Blocks', description: `The important pieces that work together in ${trimmedQuery}.` },
            { id: '3', label: 'Why It Matters', subtitle: 'Real-World Use', description: `How ${trimmedQuery} makes real software and systems faster and better.` },
          ],
        },
        hasInteractive: false,
        interactiveHtml: null,
        personalizedExample: trimmedInterests ? {
          interest: trimmedInterests,
          analogyTitle: `Understanding ${trimmedQuery} through ${trimmedInterests}`,
          analogyText: `Just like working as a team in ${trimmedInterests}, ${trimmedQuery} organizes its parts so everything runs smoothly and predictably.`,
        } : null,
      };
    }

    return NextResponse.json({
      query: trimmedQuery,
      definition: parsedData.definition || '',
      animation: parsedData.animation || null,
      hasInteractive: Boolean(parsedData.hasInteractive && parsedData.interactiveHtml),
      interactiveHtml: parsedData.interactiveHtml || null,
      personalizedExample: parsedData.personalizedExample || null,
      webContext: webData?.scannedContext || null,
      sources: webData?.links || [],
    });

  } catch (error) {
    console.error('Search Route Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to fetch results from Gemini API.' },
      { status: 500 }
    );
  }
}
