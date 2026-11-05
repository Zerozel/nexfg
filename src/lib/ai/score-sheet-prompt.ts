import type { ExtractionContext } from "@/lib/ai/vision-extractor";

/**
 * Builds the extraction prompt sent alongside the score-sheet image.
 *
 * The prompt is deliberately prescriptive:
 *   - Conditionally describes 2 or 3 CA columns based on the school's ca_count
 *   - Defines the exact JSON shape we expect
 *   - Distinguishes "blank on sheet" (null) from "teacher wrote 0" (0)
 *   - Flags out-of-range values for human review
 *   - Provides the expected student roster so the model can self-correct
 */
export function buildScoreSheetPrompt(context: ExtractionContext): string {
  const {
    schoolName,
    className,
    subjectName,
    termName,
    maxScores,
    caCount,
    expectedStudentNames,
  } = context;

  const hasCA3 = caCount >= 3;

  const roster =
    expectedStudentNames.length > 0
      ? expectedStudentNames.map((n, i) => `  ${i + 1}. ${n}`).join("\n")
      : "  (no roster provided)";

  const columnList = hasCA3
    ? `CA1 (max ${maxScores.ca1}), CA2 (max ${maxScores.ca2}), CA3 (max ${maxScores.ca3}), Exam (max ${maxScores.exam})`
    : `CA1 (max ${maxScores.ca1}), CA2 (max ${maxScores.ca2}), Exam (max ${maxScores.exam})`;

  const schemaExample = hasCA3
    ? `{
      "row_index": 1,
      "name_on_sheet": "Destiny I",
      "ca1": 12,
      "ca2": 13,
      "ca3": 11,
      "exam": 58
    }`
    : `{
      "row_index": 1,
      "name_on_sheet": "Destiny I",
      "ca1": 12,
      "ca2": 13,
      "exam": 58
    }`;

  const noCA3Rule = hasCA3
    ? ""
    : `\n9. This sheet has NO CA3 column. Never output a "ca3" field.`;

  return `You are extracting handwritten scores from a school score sheet.

CONTEXT
- School: ${schoolName}
- Class: ${className}
- Subject: ${subjectName}
- Term: ${termName}
- The sheet has ${hasCA3 ? "four" : "three"} score columns: ${columnList}.

EXPECTED STUDENT ROSTER (in printed order)
${roster}
After the last enrolled student, the sheet may contain up to 3 blank rows for late additions. Those rows have no printed name.

YOUR TASK
Read the image and return the scores for every row that has either a name or any score written.

CRITICAL RULES
1. Return ONLY valid JSON. No explanation, no markdown fences.
2. Blank cells MUST be null. Do NOT turn them into 0.
   - A teacher who left CA2 empty → "ca2": null
   - A teacher who wrote "0" → "ca2": 0
3. For handwritten names, transcribe as best you can. Preserve the case as written.
4. If a row's name matches someone in the roster, use the exact roster name.
5. If a row has a name NOT in the roster, still return it. It will be treated as a late student.
6. If a value appears out of range (e.g. CA1 = 20 when max is ${maxScores.ca1}), still return it but set "has_ambiguities": true.
7. If handwriting is unclear, make your best guess and set "has_ambiguities": true.
8. Do NOT invent scores for blank cells.${noCA3Rule}

OUTPUT SCHEMA (return exactly this shape)
{
  "students": [
    ${schemaExample}
  ],
  "has_ambiguities": false,
  "notes": null
}

Return JSON now.`;
}
