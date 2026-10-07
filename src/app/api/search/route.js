import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';
import { getWebDataForQuery, fetchGoogleImages } from '../serp-api/serpService';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function POST(req) {
  try {
    const { query, interests, includeImages } = await req.json();

    if (!query || typeof query !== 'string' || !query.trim()) {
      return NextResponse.json(
        { error: 'Search query is required.' },
        { status: 400 }
      );
    }

    const trimmedQuery = query.trim();
    const trimmedInterests = typeof interests === 'string' ? interests.trim() : '';

    console.log(`\n================== [SEARCH REQUEST] ==================`);
    console.log(`[Search] Query: "${trimmedQuery}" | Interests: "${trimmedInterests || 'none'}"`);

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

4. RULES FOR "animation.type" (YOU MUST INCLUDE EXACT SCHEMA FIELDS FOR THE CHOSEN TYPE):

1. "connectors" -> For mind maps, hierarchies, step-by-step chains, concept trees, or entity breakdowns.
   Schema:
   {
     "type": "connectors",
     "pattern": "mindmap",
     "title": "${trimmedQuery}",
     "description": "Short subtitle in simple words",
     "root": { "id": "root", "label": "Main Topic", "subtitle": "Core Role/Type", "description": "Simple 1-sentence explanation of what this main topic/entity is." },
     "branches": [
       { "id": "1", "label": "Real Subtopic 1 (NEVER use generic placeholder)", "subtitle": "Role / Feature", "description": "Simple 1-sentence explanation of what this part does." },
       { "id": "2", "label": "Real Subtopic 2 (NEVER use generic placeholder)", "subtitle": "Role / Feature", "description": "Simple 1-sentence explanation of what this part does." },
       { "id": "3", "label": "Real Subtopic 3 (NEVER use generic placeholder)", "subtitle": "Role / Feature", "description": "Simple 1-sentence explanation of what this part does." }
     ]
   }

2. "orbiter" -> For things revolving around a central core hub.
   Schema:
   {
     "type": "orbiter",
     "title": "${trimmedQuery}",
     "description": "Short subtitle in simple words",
     "core": { "label": "Center Core", "subtitle": "Main Hub", "description": "Simple 1-sentence explanation." },
     "satellites": [
       { "id": "1", "label": "Orbiting Part 1", "subtitle": "Inner Ring", "description": "Simple 1-sentence explanation." },
       { "id": "2", "label": "Orbiting Part 2", "subtitle": "Middle Ring", "description": "Simple 1-sentence explanation." },
       { "id": "3", "label": "Orbiting Part 3", "subtitle": "Outer Ring", "description": "Simple 1-sentence explanation." }
     ]
   }

3. "animatedlist" -> For Stack (LIFO: vertical), Queue (FIFO: horizontal), or Priority Queue.
   Schema:
   {
     "type": "animatedlist",
     "mode": "stack" | "queue" | "list",
     "title": "${trimmedQuery}",
     "description": "Short subtitle in simple words",
     "items": [
       { "id": "1", "label": "Item 1", "subtitle": "Details", "badge": "TOP or FRONT", "description": "Simple 1-sentence explanation." },
       { "id": "2", "label": "Item 2", "subtitle": "Details", "badge": "Middle", "description": "Simple 1-sentence explanation." },
       { "id": "3", "label": "Item 3", "subtitle": "Details", "badge": "Middle", "description": "Simple 1-sentence explanation." },
       { "id": "4", "label": "Item 4", "subtitle": "Details", "badge": "BOTTOM or BACK", "description": "Simple 1-sentence explanation." }
     ]
   }

4. "network" -> For networks, distributed systems, internet routes, client-server databases.
   Schema:
   {
     "type": "network",
     "title": "${trimmedQuery}",
     "description": "Short subtitle in simple words",
     "nodes": [
       { "id": "1", "label": "Node 1", "subtitle": "Client", "description": "Description." },
       { "id": "2", "label": "Node 2", "subtitle": "Server", "description": "Description." },
       { "id": "3", "label": "Node 3", "subtitle": "Database", "description": "Description." }
     ],
     "connections": [
       { "from": "1", "to": "2", "label": "Request" },
       { "from": "2", "to": "3", "label": "Query" }
     ]
   }

5. "dotmultiplier" -> For Cell multiplication, Mitosis, Magnets, Gravity, Physics collisions, or multiplying blobs.
   Schema:
   {
     "type": "dotmultiplier",
     "title": "${trimmedQuery}",
     "description": "Short subtitle in simple words",
     "nodes": [
       { "id": "1", "label": "Starting Source", "subtitle": "Origin", "description": "Simple 1-sentence explanation." },
       { "id": "2", "label": "Result", "subtitle": "Target", "description": "Simple 1-sentence explanation." },
       { "id": "3", "label": "Connecting Force", "subtitle": "Action", "description": "Simple 1-sentence explanation." }
     ]
   }

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
You are running as gemini-3.5-flash-lite. Your internal training knowledge base has a cutoff and you hallucinate if asked about newer technologies, modern frameworks, recent software updates, current AI models, YouTubers, online influencers, or recent events post-cutoff.
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

    console.log(`[Search] AI initial assessment for "${trimmedQuery}":`, {
      needsSearch: parsedData?.needsSearch ?? true,
      searchQuery: parsedData?.searchQuery || trimmedQuery,
    });

    // If AI indicated it needs SerpApi search or if knowledge check flagged it
    if (!parsedData || parsedData.needsSearch === true) {
      const searchQuery = parsedData?.searchQuery || trimmedQuery;
      console.log(`[Search] Performing live web search via SerpApi for: "${searchQuery}"`);

      // 1. Fetch SerpApi links, filter out social links (or use snippets if all are creator/social),
      // 2. Scan website contents directly
      webData = await getWebDataForQuery(searchQuery);

      console.log(`[Search] Web data retrieved: ${webData.scannedSites.length} sources scanned | hasWebData: ${webData.hasWebData}`);

      const webContextSnippet = webData.hasWebData
        ? `\n\nLIVE SCANNED WEB DATA (Retrieved from live web sources via SerpApi for "${trimmedQuery}"):
${webData.scannedContext}

CRITICAL ACCURACY INSTRUCTION:
Use the live web information above to explain "${trimmedQuery}".
Ground your definition, animation (including specific branch/node labels), and personalized example strictly in the facts from these web sources. Do NOT use generic placeholders like "Component A". Do NOT hallucinate.`
        : '';

      const groundedModel = genAI.getGenerativeModel({
        model: 'gemini-3.5-flash-lite',
        generationConfig: {
          responseMimeType: 'application/json',
        },
        systemInstruction: `You are a friendly, world-class educator who specializes in explaining concepts in SIMPLE, intuitive, easy-to-understand plain English.${personalizationInstruction}
${webContextSnippet}

${commonSchemaInstruction}`,
      });

      const secondPrompt = trimmedInterests
        ? `Explain the topic: "${trimmedQuery}" based on the verified live web information using simple, beginner-friendly plain English. Create a standard visual diagram in "animation", and a separate simple real-world analogy in "personalizedExample" for interest: "${trimmedInterests}".`
        : `Explain the topic: "${trimmedQuery}" based on the verified live web information using simple, beginner-friendly plain English.`;

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
        definition: `${trimmedQuery} is an engaging topic that brings together enthusiasts and organizes ideas efficiently.`,
        animation: {
          type: 'connectors',
          pattern: 'mindmap',
          title: trimmedQuery,
          description: 'Key Concepts & Focus Areas',
          root: {
            id: 'root',
            label: trimmedQuery,
            subtitle: 'Core Concept',
            description: `The main focus behind ${trimmedQuery}.`,
          },
          branches: [
            { id: '1', label: 'Primary Focus', subtitle: 'Main Subject', description: `What ${trimmedQuery} is best known for.` },
            { id: '2', label: 'Content & Work', subtitle: 'Key Activities', description: `The primary projects, reviews, or activities.` },
            { id: '3', label: 'Community', subtitle: 'Audience & Impact', description: `How ${trimmedQuery} engages its community.` },
          ],
        },
        hasInteractive: false,
        interactiveHtml: null,
        personalizedExample: trimmedInterests ? {
          interest: trimmedInterests,
          analogyTitle: `Understanding ${trimmedQuery} through ${trimmedInterests}`,
          analogyText: `Just like in ${trimmedInterests}, ${trimmedQuery} focuses on dedicated passion and continuous exploration.`,
        } : null,
      };
    }

    // Ensure animation has properly labeled branches if connectors was chosen
    if (parsedData.animation?.type === 'connectors' && (!parsedData.animation.branches || parsedData.animation.branches.length === 0)) {
      parsedData.animation.branches = [
        { id: '1', label: 'Key Feature', subtitle: 'Overview', description: `Main aspect of ${trimmedQuery}.` },
        { id: '2', label: 'Work & Projects', subtitle: 'Activities', description: `Core activities and output.` },
        { id: '3', label: 'Community & Reach', subtitle: 'Impact', description: `Audience and engagement.` }
      ];
    }

    console.log(`[Search] Completed response for: "${trimmedQuery}"`);
    console.log(`         Definition: ${parsedData.definition.slice(0, 80)}...`);
    console.log(`         Animation type: ${parsedData.animation?.type}`);
    if (parsedData.animation?.branches) {
      console.log(`         Branches:`, parsedData.animation.branches.map(b => b.label));
    }
    console.log(`         Sources attached:`, webData?.links?.length || 0);
    console.log(`=======================================================\n`);

    let images = [];
    if (includeImages) {
      try {
        images = await fetchGoogleImages(trimmedQuery, 2);
      } catch (imgErr) {
        console.warn('[Search] Failed to fetch images:', imgErr);
      }
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
      images: images || [],
    });

  } catch (error) {
    console.error('Search Route Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to fetch results from Gemini API.' },
      { status: 500 }
    );
  }
}
