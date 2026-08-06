// supabase/functions/scores-bulk/database.ts

// @ts-nocheck - Deno runtime with URL imports and .ts extensions
import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";
import type { ValidatedRecord, ValidationError, ValidationResult, StudentRow, AssessmentRow } from "./types.ts";

// Deno environment declaration
declare const Deno: {
  env: {
    get(key: string): string | undefined;
  };
};

export function createSupabaseClient(authHeader: string): SupabaseClient {
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    throw new Error("Missing required environment variables: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY");
  }

  return createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
    global: {
      headers: {
        Authorization: authHeader,
      },
    },
  });
}

export async function validateRecords(
  supabase: SupabaseClient,
  scores: ValidatedRecord[],
  schoolId: string
): Promise<ValidationResult> {
  const valid: ValidatedRecord[] = [];
  const failed: ValidationError[] = [];

  // Extract unique student and assessment IDs for batch queries
  const studentIds = Array.from(new Set(scores.map((s: ValidatedRecord) => s.student_id)));
  const assessmentIds = Array.from(new Set(scores.map((s: ValidatedRecord) => s.assessment_id)));

  // Batch fetch students
  const { data: students, error: studentError } = await supabase
    .from("students")
    .select("id, is_active, is_deleted")
    .in("id", studentIds)
    .eq("school_id", schoolId);

  if (studentError) {
    console.error("Error fetching students:", studentError);
    throw new Error(`Database error while validating students: ${studentError.message}`);
  }

  // Batch fetch assessments
  const { data: assessments, error: assessmentError } = await supabase
    .from("assessments")
    .select("id, max_score")
    .in("id", assessmentIds)
    .eq("school_id", schoolId);

  if (assessmentError) {
    console.error("Error fetching assessments:", assessmentError);
    throw new Error(`Database error while validating assessments: ${assessmentError.message}`);
  }

  // Create maps for O(1) lookups with proper typing
  const studentMap = new Map<string, StudentRow>();
  if (students) {
    for (const student of students) {
      studentMap.set(student.id, student as StudentRow);
    }
  }

  const assessmentMap = new Map<string, AssessmentRow>();
  if (assessments) {
    for (const assessment of assessments) {
      assessmentMap.set(assessment.id, assessment as AssessmentRow);
    }
  }

  // Validate each record
  for (const record of scores) {
    const student = studentMap.get(record.student_id);
    const assessment = assessmentMap.get(record.assessment_id);

    if (!student) {
      failed.push({
        index: record.index,
        student_id: record.student_id,
        assessment_id: record.assessment_id,
        reason: "student_id does not exist or belongs to different school",
      });
      continue;
    }

    if (!student.is_active) {
      failed.push({
        index: record.index,
        student_id: record.student_id,
        assessment_id: record.assessment_id,
        reason: "student is not active",
      });
      continue;
    }

    if (student.is_deleted) {
      failed.push({
        index: record.index,
        student_id: record.student_id,
        assessment_id: record.assessment_id,
        reason: "student has been deleted",
      });
      continue;
    }

    if (!assessment) {
      failed.push({
        index: record.index,
        student_id: record.student_id,
        assessment_id: record.assessment_id,
        reason: "assessment_id does not exist or belongs to different school",
      });
      continue;
    }

    if (record.score !== null) {
      if (record.score < 0) {
        failed.push({
          index: record.index,
          student_id: record.student_id,
          assessment_id: record.assessment_id,
          reason: "score cannot be negative",
        });
        continue;
      }

      if (record.score > assessment.max_score) {
        failed.push({
          index: record.index,
          student_id: record.student_id,
          assessment_id: record.assessment_id,
          reason: `score exceeds max_score (${assessment.max_score}) for this assessment`,
        });
        continue;
      }
    }

    valid.push(record);
  }

  return { valid, failed };
}

export async function executeBatchUpsert(
  supabase: SupabaseClient,
  records: ValidatedRecord[],
  schoolId: string
): Promise<{ inserted: number; updated: number }> {
  if (records.length === 0) {
    return { inserted: 0, updated: 0 };
  }

  const values = records.map((record: ValidatedRecord) => ({
    student_id: record.student_id,
    assessment_id: record.assessment_id,
    score: record.score,
  }));

  const { data, error } = await supabase
    .from("scores")
    .upsert(values, {
      onConflict: "school_id, student_id, assessment_id",
      ignoreDuplicates: false,
    })
    .select("id, student_id, assessment_id, xmax::text");

  if (error) {
    console.error("Batch UPSERT error:", error);
    throw new Error(`Database UPSERT failed: ${error.message}`);
  }

  let inserted = 0;
  let updated = 0;

  if (data) {
    for (const row of data) {
      const rowData = row as { xmax: string };
      if (rowData.xmax === "0") {
        inserted++;
      } else {
        updated++;
      }
    }
  }

  return { inserted, updated };
}
