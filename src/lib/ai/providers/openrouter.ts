import type {
  VisionProvider,
  ScoreSheetExtractionResult,
  ExtractionContext,
} from "@/lib/ai/vision-extractor";
import { buildScoreSheetPrompt } from "@/lib/ai/score-sheet-prompt";

/**
 * OpenRouter vision provider with model fallback.
 *
 * IMPORTANT: Free models on OpenRouter are volatile. IDs get retired,
 * renamed, and lose provider endpoints without notice. If all models fail,
 * check the current free model list at https://openrouter.ai/models?max_price=0
 * and update MODEL_CHAIN below.
 *
 * PRIVACY: Free models require "Model Training" to be enabled in your
 * OpenRouter Privacy Settings. Without it, ALL free models return 404.
 * See https://openrouter.ai/settings/privacy
 */

const OPENROUTER_ENDPOINT = "https://openrouter.ai/api/v1/chat/completions";

/**
 * Ordered list of free vision-capable models to try.
 *
 * As of the last verified date, these models support:
 *   - Image input
 *   - Structured / JSON output (required for our extraction)
 *
 * Do NOT add Gemma 3 models — they do not support structured output
 * or system instructions on OpenRouter.
 */
const MODEL_CHAIN = [
  "google/gemma-4-31b-it:free",
  "google/gemma-4-26b-a4b-it:free",
  "nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free",
  "qwen/qwen3.7-flash:free",
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
      "HTTP-Referer": "https://nexaforges.me",
      "X-Title": "NexaForge Score Sheet Extraction",
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: 0,
      // Do NOT send response_format — not all free models support it,
      // and Gemma models return 400 if it's present.
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

    const errors: string[] = [];

    for (const model of MODEL_CHAIN) {
      try {
        const raw = await callOpenRouter(model, messages, apiKey);
        return parseResult(raw);
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        errors.push(`${model}: ${msg}`);
        console.warn(`Vision model ${model} failed, trying next:`, msg);
        continue;
      }
    }

    throw new Error(
      `All vision models failed:\n${errors.join("\n")}`
    );
  },
};
