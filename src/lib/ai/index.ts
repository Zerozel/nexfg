import type { VisionProvider } from "@/lib/ai/vision-extractor";
import { openRouterProvider } from "@/lib/ai/providers/openrouter";

/**
 * The active vision provider.
 * To swap providers later, replace this export with another implementation
 * of VisionProvider — nothing else in the codebase needs to change.
 */
export const visionProvider: VisionProvider = openRouterProvider;

export type {
  VisionProvider,
  ScoreSheetExtractionResult,
  ScoreSheetExtractedStudent,
  ExtractionContext,
} from "@/lib/ai/vision-extractor";
