
import { auth } from "../config/firebase";
import { userService } from "./userService";
import { YoutubeTranscript } from 'youtube-transcript';
import { VideoAnalysis } from "../types";

export interface AIResponse {
  question: string;
  answer: string;
}

export interface AIResponseBatch {
    flashcards: AIResponse[];
    category: string;
    summary?: string;
}

const VISION_MODELS = [
    "meta-llama/llama-4-scout-17b-16e-instruct"
];

const callGroqAPI = async (payload: any) => {
  if (auth.currentUser) {
    const hasTokens = await userService.hasTokens(auth.currentUser.uid);
    if (!hasTokens) throw new Error("Potrošili ste sve API tokene. Molimo pređite na PRO plan.");
  }

  const res = await fetch('/api/groq', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || err.details || "Greška pri komunikaciji sa serverom.");
  }
  
  const completion = await res.json();
  
  if (auth.currentUser && completion.usage?.total_tokens) {
    userService.deductTokens(auth.currentUser.uid, completion.usage.total_tokens).catch(console.error);
  }
  
  return completion;
};

const normalizeCards = (data: any): AIResponse[] => {
    let rawCards: any[] = [];
    if (Array.isArray(data)) rawCards = data;
    else if (data.flashcards) rawCards = data.flashcards;
    else if (data.cards) rawCards = data.cards;
    else {
        const arrayKey = Object.keys(data).find(k => Array.isArray(data[k]));
        if (arrayKey) rawCards = data[arrayKey];
    }
    return rawCards.map(card => ({
        question: String(card.question || card.pitanje || "").trim(),
        answer: String(card.answer || card.odgovor || "").trim()
    })).filter(card => card.question.length > 1);
};

export const fetchYouTubeTranscript = async (url: string): Promise<string | null> => {
    const videoIdMatch = url.match(/(?:v=|\/embed\/|youtu.be\/)([^&?#]+)/);
    const videoId = videoIdMatch?.[1];
    if (!videoId) throw new Error("Invalid YouTube URL.");

    try {
        const raw = await YoutubeTranscript.fetchTranscript(videoId);
        return raw.map(t => t.text).join(' ');
    } catch (err: any) {
        console.warn("Transcript not available, using metadata fallback.");
        return null;
    }
};

export const fetchVideoMetadata = async (url: string): Promise<{title: string, author: string}> => {
    try {
        const response = await fetch(`https://noembed.com/embed?url=${encodeURIComponent(url)}`);
        const data = await response.json();
        return {
            title: data.title || "Unknown Title",
            author: data.author_name || "Unknown Author"
        };
    } catch (e) {
        return { title: "YouTube Video", author: "Creator" };
    }
};

export const analyzeYouTubeVideo = async (url: string): Promise<VideoAnalysis> => {

    let transcript = await fetchYouTubeTranscript(url);
    const metadata = await fetchVideoMetadata(url);

    let contentToAnalyze = "";
    let systemInstruction = "";

    if (transcript) {
        contentToAnalyze = `Transcript: ${transcript.slice(0, 15000)}`;
        systemInstruction = "You are an educational AI. Analyze the transcript and generate study materials.";
    } else {
        contentToAnalyze = `Video Title: ${metadata.title}\nChannel: ${metadata.author}`;
        systemInstruction = "I couldn't extract the transcript, but here is the video title. Use your internal knowledge to provide a high-level summary and general educational flashcards related to this topic.";
    }

    const res = await callGroqAPI({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: `${systemInstruction} Odgovaraj SAMO validnim JSON-om.` },
        { role: 'user', content: `Analiziraj ove podatke o videu. Vrati SAMO JSON u ovom formatu:
{
  "summary": "Detaljan i strukturiran rezime koji pokriva glavnu tezu i ključne argumente (min 6 rečenica)",
  "key_points": ["konkretne i važne tačke izvučene iz sadržaja"],
  "flashcards": [{"question": "Pitanje?", "answer": "Odgovor"}],
  "topics": ["lista relevantnih tema"],
  "difficulty": "beginner|intermediate|advanced"
}
Napravi minimum 10 flashcards koje pokrivaju najbitnije koncepte.
${contentToAnalyze}`
        }
      ],
      max_tokens: 2500
    });

    try {
        const content = res.choices[0].message.content!;
        const cleanJson = content.replace(/```json/g, "").replace(/```/g, "").trim();
        return JSON.parse(cleanJson);
    } catch (err) {
        throw new Error("AI returned invalid JSON.");
    }
};

export const generateFlashcardsFromText = async (text: string): Promise<AIResponseBatch> => {
  const completion = await callGroqAPI({
    messages: [{ role: "system", content: "Extract info into flashcards & category. Return JSON: {\"category\": \"...\", \"flashcards\": [{\"question\": \"...\", \"answer\": \"...\"}]}. Same language as input." }, { role: "user", content: `Text: ${text.substring(0, 15000)}` }],
    model: "llama-3.3-70b-versatile", temperature: 0.1, response_format: { type: "json_object" }
  });
  const parsed = JSON.parse(completion.choices[0]?.message?.content || "{}");
  return { flashcards: normalizeCards(parsed), category: parsed.category || "General Study" };
};

export const generateFlashcardsWithGroq = async (imageBase64: string): Promise<AIResponseBatch> => {
  for (const modelId of VISION_MODELS) {
    try {
      const completion = await callGroqAPI({
        messages: [{ role: "user", content: [{ type: "text", text: "Analyze image for flashcards & category. Return JSON: {\"category\": \"...\", \"flashcards\": [{\"question\": \"...\", \"answer\": \"...\"}]}. Same language." }, { type: "image_url", image_url: { url: imageBase64 } }]}],
        model: modelId, temperature: 0.1, response_format: { type: "json_object" }
      });
      const parsed = JSON.parse(completion.choices[0]?.message?.content || "{}");
      return { flashcards: normalizeCards(parsed), category: parsed.category || "Image Analysis" };
    } catch (e) {}
  }
  throw new Error("Vision AI failed.");
};

export const analyzeContent = async (mode: 'summarize' | 'expand', data: { imageBase64?: string, text?: string }): Promise<{ content: string, category: string }> => {

  const system = `You are a world-class academic assistant specializing in content analysis.
  Return strictly JSON: {"category": "...", "content": "..."}.
  Respond EXCLUSIVELY in the same language as the input text.
  Use proper Markdown formatting (headers, bold, lists) in the "content" field.
  CRITICAL: Use LaTeX for ALL mathematical, physical, and chemical formulas. 
  - Inline Math: Wrap in $ ... $
  - Block Math: Wrap in $$ ... $$
  Do not use raw unicode symbols for math; use LaTeX.`;

  const summarizePrompt = `PERFORM HIGH-DENSITY SUMMARIZATION:
  1. Distill the text into its absolute core concepts and essential definitions.
  2. Use bullet points for key takeaways.
  3. Bold important terms.
  4. Eliminate all filler, repetition, and non-essential context.
  5. Goal: Maximum information density in minimum space.`;

  const expandPrompt = `PERFORM COMPREHENSIVE ACADEMIC EXPANSION:
  1. Conduct a deep dive into the subject matter.
  2. Explain the "why" and "how" behind the concepts.
  3. Provide technical context, potential applications, and related theoretical frameworks.
  4. Use clear hierarchical headers (##, ###) and detailed paragraphs.
  5. Goal: Exhaustive, scholarly coverage that provides deep understanding.`;

  const prompt = mode === 'summarize' ? summarizePrompt : expandPrompt;

  if (!data.imageBase64) {
      const completion = await callGroqAPI({
        messages: [{ role: "system", content: system }, { role: "user", content: `${prompt}\n\nContent to analyze:\n${data.text}` }],
        model: "llama-3.3-70b-versatile", temperature: 0.3, response_format: { type: "json_object" }
      });
      const parsed = JSON.parse(completion.choices[0]?.message?.content || "{}");
      return { content: parsed.content || "No analysis generated.", category: parsed.category || "General Analysis" };
  }

  for (const modelId of VISION_MODELS) {
      try {
          const completion = await callGroqAPI({
            messages: [{ role: "user", content: [{ type: "text", text: `${prompt}\n${system}` }, { type: "image_url", image_url: { url: data.imageBase64 } }]}],
            model: modelId, temperature: 0.3, response_format: { type: "json_object" }
          });
          const parsed = JSON.parse(completion.choices[0]?.message?.content || "{}");
          return { content: parsed.content || "No analysis generated.", category: parsed.category || "Image Analysis" };
      } catch (e) {}
  }
  throw new Error("Vision AI analysis failed.");
};

export const askTutor = async (question: string, context: string, history: any[]): Promise<string> => {
    const cleanedHistory = history.map(({ role, content }) => ({ role, content }));
    try {
        const systemPrompt = `You are a professional study tutor. Provide clear, accurate, and pedagogical help.
        CRITICAL: Use LaTeX for ALL formulas, equations, and technical symbols.
        - Inline: $ ... $
        - Block: $$ ... $$
        Context from document: ${context.substring(0, 10000)}`;

        const completion = await callGroqAPI({
            messages: [{ role: "system", content: systemPrompt }, ...cleanedHistory, { role: "user", content: question }],
            model: "llama-3.3-70b-versatile", temperature: 0.5,
        });
        return completion.choices[0]?.message?.content || "I'm sorry.";
    } catch (err) { throw err; }
};

export const generateQuizFromContent = async (text: string): Promise<any[]> => {
    try {
        const completion = await callGroqAPI({
            messages: [{ role: "system", content: "Generate 5 MCQ quiz in JSON: {\"quiz\": [{\"question\": \"...\", \"options\": [...], \"correctAnswer\": \"...\"}]}. Same language." }, { role: "user", content: `Text: ${text.substring(0, 10000)}` }],
            model: "llama-3.3-70b-versatile", temperature: 0.2, response_format: { type: "json_object" }
        });
        const content = JSON.parse(completion.choices[0]?.message?.content || "{}");
        return content.quiz || [];
    } catch (err) { throw err; }
};

export const solveProblem = async (problem: string, imageBase64?: string): Promise<string> => {
    const systemPrompt = `You are an elite Academic Solver with a PhD in Mathematics, Physics, and Chemistry.
    Your goal is to provide 100% accurate, rigorous, and visually stunning solutions.

    REASONING PROCESS:
    1. Analysis: Identify core concepts, constraints, and variables.
    2. Transcription Verification: If OCR was used, cross-reference symbols to ensure they make mathematical sense.
    3. Step-by-Step: Derivate the solution with extreme clarity.
    4. Verification: Plug the answer back in to confirm correctness.

    STRICT FORMATTING GUIDELINES:
    1. LaTeX DELIMITERS: 
       - Inline Math: Wrap in exactly one pair of dollar signs: $ ... $.
       - Block Math: Wrap in exactly two pairs of dollar signs ON SEPARATE LINES:
         $$
         \text{formula here}
         $$
    2. USE LaTeX FOR EVERYTHING: Even simple symbols like +, -, =, roots, and powers must be in LaTeX. NEVER use raw unicode characters like √ or −.
    3. STRUCTURE: Use exactly these Markdown headers for sections:
       ## 🎯 Analiza zadatka
       ## 📜 Ključne formule i zakoni
       ## ✍️ Detaljno rešavanje korak-po-korak
       ## 🏁 Finalni odgovor i provera
    4. LANGUAGE: Respond EXCLUSIVELY in the same language as the user's input.
    5. VISUALS: Ensure all complex fractions and roots are wrapped in braces {} correctly to avoid rendering errors.`;
    
    let problemText = problem;

    if (imageBase64) {
        let extracted = "";
        let lastError = "";
        // Accuracy Priority: Use the best vision model and provide context
        for (const modelId of VISION_MODELS) {
            try {
                const ocrCompletion = await callGroqAPI({
                    messages: [
                        { 
                          role: "system", 
                          content: "You are a professional mathematical OCR engine. Transcribe the image into LaTeX. Be extremely careful with nested fractions, square roots, and subscripts. Output ONLY the transcribed LaTeX problem. Do not solve. Use standard LaTeX symbols (e.g., \\sqrt{}, \\frac{}{}, \\cdot)." 
                        },
                        { role: "user", content: [
                            { type: "text", text: "Transcribe this problem into perfect LaTeX:" },
                            { type: "image_url", image_url: { url: imageBase64 } }
                        ]}
                    ],
                    model: modelId,
                    temperature: 0,
                });
                extracted = ocrCompletion.choices[0]?.message?.content || "";
                if (extracted) break;
            } catch (e: any) {
                lastError = e?.message || String(e);
            }
        }
        
        if (!extracted && !problem) {
            throw new Error(`AI nije mogao da pročita sliku. Molimo probajte da prekucate zadatak.`);
        }
        problemText = `[Transcribed Problem]: ${extracted}\n\n[User Context]: ${problem}`;
    }

    try {
        const completion = await callGroqAPI({
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: `Solve this problem following the strict formatting rules. Ensure all mathematical expressions are perfectly formatted in LaTeX for rendering:\n\n${problemText}` }
            ],
            model: "llama-3.3-70b-versatile",
            temperature: 0,
        });
        
        return completion.choices[0]?.message?.content || "Nažalost, nisam uspeo da generišem rešenje.";
    } catch (err: any) {
        throw new Error(`Greška pri rešavanju zadatka. Detalji: ${err?.message}`);
    }
};
