// supabase/functions/scores-bulk/validation.ts

// @ts-nocheck - Deno runtime with different module resolution
import type { BulkScoresRequest } from "./types.ts";

const MAX_BATCH_SIZE = 1000;

export function validatePayload(body: unknown): { valid: true; data: BulkScoresRequest } | { valid: false; errors: string[] } {
  const errors: string[] = [];

  if (!body || typeof body !== 'object') {
    return { valid: false, errors: ['Request body must be a JSON object'] };
  }

  const payload = body as Record<string, unknown>;

  if (!payload.scores) {
    return { valid: false, errors: ['Missing required field: scores'] };
  }

  if (!Array.isArray(payload.scores)) {
    return { valid: false, errors: ['scores must be an array'] };
  }

  if (payload.scores.length === 0) {
    return { valid: false, errors: ['scores must be a non-empty array'] };
  }

  if (payload.scores.length > MAX_BATCH_SIZE) {
    return { valid: false, errors: [`Max ${MAX_BATCH_SIZE} records per request. Received: ${payload.scores.length}`] };
  }

  // Validate each score entry structure
  for (let i = 0; i < payload.scores.length; i++) {
    const entry = payload.scores[i];
    if (!entry || typeof entry !== 'object') {
      errors.push(`scores[${i}] must be an object`);
      continue;
    }

    const score = entry as Record<string, unknown>;

    // Validate student_id
    if (!score.student_id || typeof score.student_id !== 'string') {
      errors.push(`scores[${i}].student_id must be a valid UUID string`);
    } else if (!isValidUUID(score.student_id)) {
      errors.push(`scores[${i}].student_id is not a valid UUID`);
    }

    // Validate assessment_id
    if (!score.assessment_id || typeof score.assessment_id !== 'string') {
      errors.push(`scores[${i}].assessment_id must be a valid UUID string`);
    } else if (!isValidUUID(score.assessment_id)) {
      errors.push(`scores[${i}].assessment_id is not a valid UUID`);
    }

    // Validate score (can be null or a number)
    if (score.score !== null && score.score !== undefined) {
      if (typeof score.score !== 'number' || !Number.isFinite(score.score)) {
        errors.push(`scores[${i}].score must be a number or null`);
      }
    }
  }

  if (errors.length > 0) {
    return { valid: false, errors };
  }

  return { valid: true, data: body as BulkScoresRequest };
}

export function isValidUUID(str: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
}
