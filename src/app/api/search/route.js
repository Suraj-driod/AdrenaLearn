import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';

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

    const model = genAI.getGenerativeModel({
      model: 'gemini-3.5-flash-lite',
      generationConfig: {
        responseMimeType: 'application/json',
      },
      systemInstruction: `You are a friendly, world-class educator who specializes in explaining complex computer science, tech, and STEM concepts in SIMPLE, intuitive, easy-to-understand plain English (like explaining to a bright 10-year-old or beginner).

Your goal is to make every concept crystal clear and exciting, using simple words without dense textbook jargon or robotic academic language.${personalizationInstruction}

You MUST respond strictly with a valid JSON object matching this schema:
{
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
   - AVOID dense academic jargon, cryptic buzzwords, or textbook phrases (e.g. do NOT use "computational paradigm", "deterministic encapsulation", "invariant state transitions", "polymorphic allocation").
   - If a technical term is essential, explain it simply on the spot.

2. RULES FOR "definition":
   - Exactly ONE clear, direct sentence.
   - Explain *what it is* and *the core idea of how it works* so anyone understands on first read.
   - Example (Stack): "A Stack is a data container where items are placed on top of each other, so the last item you put in is always the first one you take out."
   - Example (Queue): "A Queue is a line of items where the first item that arrives is the first one processed, just like waiting in line at a movie theater."
   - Example (Binary Search): "Binary Search is a quick way to find an item in a sorted list by repeatedly dividing the search area in half."
   - Example (Mitosis): "Mitosis is the biological process where a single living cell splits into two identical new cells so an organism can grow and heal."
   - Example (Magnets): "A magnet is an object that produces an invisible force field that attracts certain metals and pushes or pulls other magnets."
   - No introductory filler (do NOT say "In computer science..." or "Sure!").

3. RULES FOR COMPONENT DESCRIPTIONS:
   - Every node, plate, satellite, and branch description must be 1 short, plain-English sentence explaining its role simply and clearly.

4. RULES FOR "animation.type":
Choose the best suited template for the topic:

1. "connectors" -> For mind maps, hierarchies, step-by-step chains, or concept trees (e.g., Web Development Stack, Compilation Stages, Machine Learning types, Solar System hierarchy).
   Schema:
   {
     "type": "connectors",
     "pattern": "mindmap" | "one-to-many" | "chain",
     "title": "Title",
     "description": "Short subtitle in simple words",
     "root": { "id": "root", "label": "Main Topic", "subtitle": "Core Idea", "description": "Simple 1-sentence explanation of what this main topic is." },
     "branches": [
       { "id": "1", "label": "Subtopic A", "subtitle": "Role / Feature", "description": "Simple 1-sentence explanation of what this part does." },
       { "id": "2", "label": "Subtopic B", "subtitle": "Role / Feature", "description": "Simple 1-sentence explanation of what this part does." },
       { "id": "3", "label": "Subtopic C", "subtitle": "Role / Feature", "description": "Simple 1-sentence explanation of what this part does." }
     ]
   }

2. "orbiter" -> For things revolving around a central core hub (e.g. Solar System Planets, React Ecosystem, JavaScript Event Loop, Atom / Electrons, Operating System Kernel).
   Schema:
   {
     "type": "orbiter",
     "title": "Title",
     "description": "Short subtitle in simple words",
     "core": { "label": "Center Core (e.g. Sun / Kernel)", "subtitle": "Main Hub", "description": "Simple 1-sentence explanation of the central hub." },
     "satellites": [
       { "id": "1", "label": "Orbiting Part 1", "subtitle": "Inner Ring", "description": "Simple 1-sentence explanation of what this part does." },
       { "id": "2", "label": "Orbiting Part 2", "subtitle": "Middle Ring", "description": "Simple 1-sentence explanation of what this part does." },
       { "id": "3", "label": "Orbiting Part 3", "subtitle": "Outer Ring", "description": "Simple 1-sentence explanation of what this part does." }
     ]
   }

3. "animatedlist" -> For Stack (LIFO: horizontal plates stacked vertically), Queue (FIFO: vertical standing plates in a horizontal line), or Priority Queue.
   Schema:
   {
     "type": "animatedlist",
     "mode": "stack" | "queue" | "list",
     "title": "Title",
     "description": "Short subtitle in simple words",
     "items": [
       { "id": "1", "label": "Item 1", "subtitle": "Details", "badge": "TOP (for stack) or FRONT (for queue)", "description": "Simple 1-sentence explanation." },
       { "id": "2", "label": "Item 2", "subtitle": "Details", "badge": "Middle", "description": "Simple 1-sentence explanation." },
       { "id": "3", "label": "Item 3", "subtitle": "Details", "badge": "Middle", "description": "Simple 1-sentence explanation." },
       { "id": "4", "label": "Item 4", "subtitle": "Details", "badge": "BOTTOM (for stack) or BACK (for queue)", "description": "Simple 1-sentence explanation." }
     ]
   }

4. "network" -> For networks, distributed systems, internet routes, DNS lookup, authentication steps, client-server databases.
   Schema:
   {
     "type": "network",
     "title": "Title",
     "description": "Short subtitle in simple words",
     "nodes": [
       { "id": "1", "label": "User / Browser", "subtitle": "Client", "description": "Where the user starts the request." },
       { "id": "2", "label": "Server", "subtitle": "Processor", "description": "Receives and handles the incoming requests." },
       { "id": "3", "label": "Database", "subtitle": "Storage", "description": "Safely stores and retrieves saved data." },
       { "id": "4", "label": "Cache", "subtitle": "Fast Memory", "description": "Quickly serves repeated requests." }
     ],
     "connections": [
       { "from": "1", "to": "2", "label": "Send Request" },
       { "from": "2", "to": "3", "label": "Save / Load Data" },
       { "from": "2", "to": "4", "label": "Check Quick Cache" }
     ]
   }

5. "dotmultiplier" -> For Cell multiplication, Mitosis, How magnets work (magnetic poles / attraction / repulsion), Gravity, Physics collisions, or multiplying blobs.
   Schema:
   {
     "type": "dotmultiplier",
     "title": "Title",
     "description": "Short subtitle in simple words",
     "nodes": [
       { "id": "1", "label": "Starting Source (e.g. North Pole / Parent Cell)", "subtitle": "Origin", "description": "Simple 1-sentence explanation." },
       { "id": "2", "label": "Result (e.g. South Pole / Daughter Cell)", "subtitle": "Target", "description": "Simple 1-sentence explanation." },
       { "id": "3", "label": "Connecting Force (e.g. Magnetic Field / Spindle)", "subtitle": "Action", "description": "Simple 1-sentence explanation." },
       { "id": "4", "label": "Surrounding Particles", "subtitle": "Environment", "description": "Simple 1-sentence explanation." }
     ]
   }

5. RULES FOR "hasInteractive" and "interactiveHtml":
- Set "hasInteractive" to true ONLY if the topic is an interactive simulation (e.g., Stack push/pop, Queue enqueue/dequeue, Binary Search player).
- For conceptual topics, set "hasInteractive" to false and "interactiveHtml" to null.
- If true, provide a clean, self-contained HTML5 dark sandbox with simple controls (e.g. Push, Pop, Enqueue, Dequeue, Step, Play).
- ABSOLUTELY REFRAIN from adding any "Reset", "Restart", "Clear", or "Replay" buttons inside the iframe HTML. The parent card border already has an outer Replay button. Do NOT duplicate it inside the iframe.`,
    });

    const promptMessage = trimmedInterests
      ? `Explain the topic: "${trimmedQuery}" using simple, beginner-friendly plain English. Create a standard visual diagram in "animation", and a separate simple real-world analogy in "personalizedExample" for interest: "${trimmedInterests}".`
      : `Explain the topic: "${trimmedQuery}" using simple, beginner-friendly plain English.`;

    let parsedData;

    try {
      const result = await model.generateContent(promptMessage);
      const responseText = result.response.text();

      let cleanText = responseText.trim();
      if (cleanText.startsWith('```json')) {
        cleanText = cleanText.replace(/^```json\s*/, '').replace(/```\s*$/, '');
      } else if (cleanText.startsWith('```')) {
        cleanText = cleanText.replace(/^```\s*/, '').replace(/```\s*$/, '');
      }
      parsedData = JSON.parse(cleanText);
    } catch (genError) {
      console.warn('Gemini API call or JSON parse fallback triggered:', genError);
      parsedData = {
        definition: `${trimmedQuery} is a fundamental concept that helps organize data and make systems work efficiently.`,
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
    });

  } catch (error) {
    console.error('Search Route Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to fetch results from Gemini API.' },
      { status: 500 }
    );
  }
}
