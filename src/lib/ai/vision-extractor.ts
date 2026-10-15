/**
 * Provider-agnostic vision extraction interface.
 *
 * Any provider (OpenRouter, Google Vision + Gemini, Anthropic, etc.) must
 * implement this interface. Downstream code (API routes, hooks) only ever
 * imports from this file — swapping providers means changing one
 * implementation file, not the pipeline.
 */

export interface ScoreSheetExtractedStudent {
  /** 1-based row index as it appears on the sheet */
  row_index: number;
  /** Name written on the sheet (may be null for a blank row) */
  name_on_sheet: string | null;
  /** Scores — null means blank on the sheet, do NOT force 0 */
  ca1: number | null;
  ca2: number | null;
  ca3: number | null;
  exam: number | null;
}

export interface ScoreSheetExtractionResult {
  students: ScoreSheetExtractedStudent[];
  /** True if the model flagged any row as ambiguous */
  has_ambiguities: boolean;
  /** Optional free-text notes the model returned (e.g. "row 3 hard to read") */
  notes: string | null;
}

export interface ExtractionContext {
  /** Human-readable info to help the model sanity-check what it reads */
  schoolName: string;
  className: string;
  subjectName: string;
  termName: string;
  /** Assessment max scores so the model can flag out-of-range values */
  maxScores: {
    ca1: number;
    ca2: number;
    ca3: number;
    exam: number;
  };
  /** Names of students who should be on the sheet, in print order */
  expectedStudentNames: string[];
}

export interface VisionProvider {
  /**
   * Extract score-sheet rows from an image.
   * @param imageUrl - public URL or signed URL of the uploaded image
   * @param context - metadata about the sheet for prompt context
   */
  extractScoreSheet(
    imageUrl: string,
    context: ExtractionContext
  ): Promise<ScoreSheetExtractionResult>;
}
