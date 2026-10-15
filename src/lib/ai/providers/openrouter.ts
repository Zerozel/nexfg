import type {
  VisionProvider,
  ScoreSheetExtractionResult,
  ExtractionContext,
} from "@/lib/ai/vision-extractor";
import { buildScoreSheetPrompt } from "@/lib/ai/score-sheet-prompt";

/**
 * OpenRouter vision provider with model fallback.
 *
 * The primary model is tried first; on rate-limit or failure, the list is
 * walked in order. Only the last model's failure is surfaced.
 *
 * To swap providers (e.g. to Google Vision + Gemini), write a sibling file
 * that implements VisionProvider and change the export in
 * src/lib/ai/index.ts. Nothing else in the codebase needs to change.
 */

const OPENROUTER_ENDPOINT = "https://openrouter.ai/api/v1/chat/completions";

/** Ordered list of free vision-capable models to try. */
const MODEL_CHAIN = [
  "google/gemma-3-27b-it:free",
  "nvidia/nemotron-nano-12b-v2-vl:free",
  "qwen/qwen-vl-plus:free",
];

interface OpenRouterMessage {
  role: "system" | "user";
  content:
    | string
    | Array<
        | { type: "text"; text: string }
        | { type: "image_url"; image_url: { url: string } }
      >;
}

async function callOpenRouter(
  model: string,
  messages: OpenRouterMessage[],
  apiKey: string
): Promise<string> {
  const res = await fetch(OPENROUTER_ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      // Optional: helps OpenRouter attribute traffic. Safe to omit.
      "HTTP-Referer": "https://nexaforges.me",
      "X-Title": "NexaForge Score Sheet Extraction",
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: 0,
      response_format: { type: "json_object" },
    }),
  });

  if (!res.ok) {
    const err = await res.text().catch(() => "");
    throw new Error(
      `OpenRouter ${model} failed (${res.status}): ${err || res.statusText}`
    );
  }

  const data = await res.json();
  const content = data?.choices?.[0]?.message?.content;
  if (typeof content !== "string") {
    throw new Error(`OpenRouter ${model} returned no text content`);
  }
  return content;
}

function parseResult(raw: string): ScoreSheetExtractionResult {
  // The model is instructed to return pure JSON, but strip code fences defensively.
  const cleaned = raw
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/, "")
    .trim();

  let parsed: any;
  try {
    parsed = JSON.parse(cleaned);
  } catch (err) {
    throw new Error(`Model returned invalid JSON: ${cleaned.slice(0, 200)}`);
  }

  const students = Array.isArray(parsed?.students) ? parsed.students : [];
  return {
    students: students.map((s: any, i: number) => ({
      row_index: typeof s?.row_index === "number" ? s.row_index : i + 1,
      name_on_sheet:
        typeof s?.name_on_sheet === "string" && s.name_on_sheet.trim()
          ? s.name_on_sheet.trim()
          : null,
      ca1: typeof s?.ca1 === "number" ? s.ca1 : null,
      ca2: typeof s?.ca2 === "number" ? s.ca2 : null,
      ca3: typeof s?.ca3 === "number" ? s.ca3 : null,
      exam: typeof s?.exam === "number" ? s.exam : null,
    })),
    has_ambiguities: !!parsed?.has_ambiguities,
    notes: typeof parsed?.notes === "string" ? parsed.notes : null,
  };
}

export const openRouterProvider: VisionProvider = {
  async extractScoreSheet(
    imageUrl: string,
    context: ExtractionContext
  ): Promise<ScoreSheetExtractionResult> {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      throw new Error("OPENROUTER_API_KEY is not configured");
    }

    const prompt = buildScoreSheetPrompt(context);

    const messages: OpenRouterMessage[] = [
      {
        role: "system",
        content:
          "You are a precise OCR and structured-data extraction engine. " +
          "You read handwritten score sheets and return strict JSON only. " +
          "You never invent numbers. Blank cells stay null.",
      },
      {
        role: "user",
        content: [
          { type: "text", text: prompt },
          { type: "image_url", image_url: { url: imageUrl } },
        ],
      },
    ];

    let lastError: Error | null = null;

    for (const model of MODEL_CHAIN) {
      try {
        const raw = await callOpenRouter(model, messages, apiKey);
        return parseResult(raw);
      } catch (err) {
        lastError = err instanceof Error ? err : new Error(String(err));
        // Try the next model
        continue;
      }
    }

    throw lastError ?? new Error("All vision models failed");
  },
};
