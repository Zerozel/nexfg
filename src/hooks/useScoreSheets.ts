"use client";

import { useState, useEffect, useCallback } from "react";

export interface BatchSummary {
  id: string;
  class_id: string;
  class_name: string;
  subject_id: string;
  subject_name: string;
  term_id: string;
  term_name: string;
  academic_session: string | null;
  teacher_name: string | null;
  status: "created" | "uploaded" | "reviewed" | "confirmed" | "discarded";
  created_at: string;
  confirmed_at: string | null;
}

export interface ExtractionRow {
  id: string;
  batch_id: string;
  student_id: string | null;
  row_index: number;
  name_on_sheet: string | null;
  raw_ca1: number | null;
  raw_ca2: number | null;
  raw_ca3: number | null;
  raw_exam: number | null;
  resolved_ca1: number | null;
  resolved_ca2: number | null;
  resolved_ca3: number | null;
  resolved_exam: number | null;
  matched: boolean;
  is_extra: boolean;
}

export interface BatchDetail {
  batch: BatchSummary & { source_image_url: string | null };
  extractions: ExtractionRow[];
}

export interface SkippedRow {
  student_id: string;
  reason: string;
}

/** Thrown when the API returns 402 — the caller is not on a paid plan. */
export class UpgradeRequiredError extends Error {
  code = "UPGRADE_REQUIRED";
  constructor(message: string) {
    super(message);
    this.name = "UpgradeRequiredError";
  }
}

async function parseError(res: Response, fallback: string): Promise<Error> {
  const body = await res.json().catch(() => ({}));
  const message = body?.error || fallback;
  if (res.status === 402 || body?.code === "UPGRADE_REQUIRED") {
    return new UpgradeRequiredError(message);
  }
  return new Error(message);
}

// ── List ──

export function useScoreSheetBatches() {
  const [data, setData] = useState<BatchSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [upgradeRequired, setUpgradeRequired] = useState(false);

  const fetchBatches = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setUpgradeRequired(false);
    try {
      const res = await fetch("/api/admin/score-sheets/batches");
      if (!res.ok) {
        const err = await parseError(res, "Failed to load batches");
        if (err instanceof UpgradeRequiredError) setUpgradeRequired(true);
        throw err;
      }
      const result = await res.json();
      setData(result.data.batches || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBatches();
  }, [fetchBatches]);

  return { data, isLoading, error, upgradeRequired, refetch: fetchBatches };
}

// ── Create ──

export interface CreateBatchResult {
  batch_id: string;
}

export async function createBatch(payload: {
  class_id: string;
  subject_id: string;
  term_id: string;
}): Promise<CreateBatchResult> {
  const res = await fetch("/api/admin/score-sheets/batches", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    // Duplicate batch: surface existing_batch_id so the UI can navigate
    if (res.status === 409 && body?.code === "DUPLICATE_BATCH") {
      const err: any = new Error(body.error || "Duplicate batch");
      err.code = "DUPLICATE_BATCH";
      err.existingBatchId = body.existing_batch_id;
      throw err;
    }
    throw await parseError(res, "Failed to create batch");
  }
  const result = await res.json();
  return result.data;
}

// ── Single batch detail ──

export function useScoreSheetBatch(id: string | null) {
  const [data, setData] = useState<BatchDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBatch = useCallback(async () => {
    if (!id) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/score-sheets/batches/${id}`);
      if (!res.ok) {
        throw await parseError(res, "Failed to load batch");
      }
      const result = await res.json();
      setData(result.data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchBatch();
  }, [fetchBatch]);

  return { data, isLoading, error, refetch: fetchBatch };
}

// ── Extract ──

export interface ExtractResult {
  extracted_count: number;
  matched_count: number;
  unmatched_count: number;
  has_ambiguities: boolean;
  notes: string | null;
}

export async function extractScoreSheet(
  batchId: string,
  file: File
): Promise<ExtractResult> {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(
    `/api/admin/score-sheets/batches/${batchId}/extract`,
    { method: "POST", body: formData }
  );
  if (!res.ok) {
    throw await parseError(res, "Extraction failed");
  }
  const result = await res.json();
  return result.data;
}

// ── Resolve ──

export interface ResolveResult {
  written: number;
  audit_updated?: number;
  skipped?: SkippedRow[];
  message?: string;
}

export async function resolveScores(
  batchId: string,
  rows: Array<{
    student_id: string | null;
    ca1: number | null;
    ca2: number | null;
    ca3: number | null;
    exam: number | null;
  }>
): Promise<ResolveResult> {
  const res = await fetch(
    `/api/admin/score-sheets/batches/${batchId}/resolve`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rows }),
    }
  );
  if (!res.ok) {
    throw await parseError(res, "Save failed");
  }
  const result = await res.json();
  return result.data;
}

// ── Enrolled students (batch creator preview) ──

export interface EnrolledStudent {
  id: string;
  full_name: string;
  admission_number: string | null;
}

export interface EnrolledStudentsResult {
  students: EnrolledStudent[];
  teacher_name: string | null;
  max_scores: { ca1: number; ca2: number; ca3: number; exam: number };
}

export function useEnrolledStudents(
  classId: string | null,
  termId: string | null,
  subjectId: string | null
) {
  const [data, setData] = useState<EnrolledStudentsResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!classId || !termId || !subjectId) {
      setData(null);
      setError(null);
      return;
    }
    let cancelled = false;
    setIsLoading(true);
    setError(null);
    (async () => {
      try {
        const res = await fetch(
          `/api/admin/score-sheets/enrolled-students?classId=${classId}&termId=${termId}&subjectId=${subjectId}`
        );
        if (!res.ok) {
          const err = await parseError(res, "Failed to load roster");
          if (!cancelled) setError(err.message);
          return;
        }
        const result = await res.json();
        if (!cancelled) setData(result.data);
      } catch (err: any) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [classId, termId, subjectId]);

  return { data, isLoading, error };
}
