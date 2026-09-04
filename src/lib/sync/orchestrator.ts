import { supabase } from "@/lib/supabase/client";
import {
  getPendingScoresForClass,
  markScoreAsSynced,
  getScoresForClass,
  saveScoresForClass,
  clearSyncedScores,
} from "@/lib/storage/scores";
import type { SyncResponse } from "@/types";

// ── Session 4 Types (inlined to avoid circular deps) ──────────────────────

interface SyncRecord {
  id: string;
  student_id: string;
  assessment_id: string;
  score: number | null;
  synced: boolean;
  updated_at: string;
  sync_attempts?: number;
  last_sync_error?: string;
}

interface SyncBatch {
  id: string;
  records: SyncRecord[];
  status: "pending" | "processing" | "completed" | "failed";
  start_index: number;
  end_index: number;
  attempt_count: number;
  error_message?: string;
}

export interface SyncProgress {
  total_records: number;
  processed_records: number;
  successful_records: number;
  failed_records: number;
  current_batch: number;
  total_batches: number;
  status: "idle" | "syncing" | "completed" | "failed";
  start_time?: string;
  end_time?: string;
}

export interface SyncBatchResult {
  batch_id: string;
  success: boolean;
  inserted: number;
  updated: number;
  failed: number;
  errors: Array<{
    index: number;
    student_id: string;
    assessment_id: string;
    reason: string;
  }>;
}

interface ExtendedSyncResponse extends SyncResponse {
  batch_results?: SyncBatchResult[];
}

// ── Constants ─────────────────────────────────────────────────────────────

const MAX_BATCH_SIZE = 1000;
const MAX_RETRY_ATTEMPTS = 3;
const RETRY_DELAY_MS = 1000;

// ── Batch Splitter ────────────────────────────────────────────────────────

function splitIntoBatches(records: SyncRecord[]): SyncBatch[] {
  const batches: SyncBatch[] = [];
  const total = records.length;

  for (let i = 0; i < total; i += MAX_BATCH_SIZE) {
    const batchRecords = records.slice(i, i + MAX_BATCH_SIZE);
    batches.push({
      id: crypto.randomUUID(),
      records: batchRecords,
      status: "pending",
      start_index: i,
      end_index: Math.min(i + MAX_BATCH_SIZE, total),
      attempt_count: 0,
    });
  }

  return batches;
}

// ── Orchestrator Class ────────────────────────────────────────────────────

export class SyncOrchestrator {
  private classId: string;
  private onProgress?: (progress: SyncProgress) => void;
  private abortController: AbortController | null = null;
  private isSyncing = false;

  constructor(classId: string, onProgress?: (progress: SyncProgress) => void) {
    this.classId = classId;
    this.onProgress = onProgress;
  }

  async sync(): Promise<ExtendedSyncResponse> {
    if (this.isSyncing) {
      throw new Error("Sync already in progress");
    }

    this.isSyncing = true;
    this.abortController = new AbortController();
    const startTime = new Date().toISOString();

    try {
      const pendingRecords = getPendingScoresForClass(this.classId) as SyncRecord[];

      if (pendingRecords.length === 0) {
        const finalProgress: SyncProgress = {
          status: "completed",
          total_records: 0,
          processed_records: 0,
          successful_records: 0,
          failed_records: 0,
          current_batch: 0,
          total_batches: 0,
          start_time: startTime,
          end_time: new Date().toISOString(),
        };
        this.emitProgress(finalProgress);
        return {
          success: true,
          inserted: 0,
          updated: 0,
          failed: 0,
          errors: [],
          batch_results: [],
        };
      }

      const batches = splitIntoBatches(pendingRecords);
      const totalBatches = batches.length;
      let totalInserted = 0;
      let totalUpdated = 0;
      let totalFailed = 0;
      let totalProcessed = 0;
      const allErrors: ExtendedSyncResponse["errors"] = [];
      const batchResults: SyncBatchResult[] = [];

      for (let i = 0; i < batches.length; i++) {
        if (this.abortController?.signal.aborted) {
          throw new Error("Sync aborted by user");
        }

        const batch = batches[i];

        this.emitProgress({
          status: "syncing",
          total_records: pendingRecords.length,
          processed_records: totalProcessed,
          successful_records: totalInserted + totalUpdated,
          failed_records: totalFailed,
          current_batch: i + 1,
          total_batches: totalBatches,
          start_time: startTime,
        });

        const result = await this.processBatchWithRetry(batch);
        batchResults.push(result);

        totalInserted += result.inserted;
        totalUpdated += result.updated;
        totalFailed += result.failed;
        totalProcessed += batch.records.length;
        allErrors.push(...result.errors);

        this.updateLocalStorageAfterBatch(batch, result);
      }

      this.cleanupSyncedRecords();

      const finalProgress: SyncProgress = {
        status: "completed",
        total_records: pendingRecords.length,
        processed_records: totalProcessed,
        successful_records: totalInserted + totalUpdated,
        failed_records: totalFailed,
        current_batch: totalBatches,
        total_batches: totalBatches,
        start_time: startTime,
        end_time: new Date().toISOString(),
      };
      this.emitProgress(finalProgress);

      return {
        success: totalFailed === 0,
        inserted: totalInserted,
        updated: totalUpdated,
        failed: totalFailed,
        errors: allErrors,
        batch_results: batchResults,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      this.emitProgress({
        status: "failed",
        total_records: 0,
        processed_records: 0,
        successful_records: 0,
        failed_records: 0,
        current_batch: 0,
        total_batches: 0,
        start_time: startTime,
        end_time: new Date().toISOString(),
      });
      throw new Error(`Sync failed: ${errorMessage}`);
    } finally {
      this.isSyncing = false;
      this.abortController = null;
    }
  }

  // ── Private Methods ───────────────────────────────────────────────────

  private async processBatchWithRetry(batch: SyncBatch): Promise<SyncBatchResult> {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt < MAX_RETRY_ATTEMPTS; attempt++) {
      try {
        batch.status = "processing";
        batch.attempt_count = attempt + 1;

        if (attempt > 0) {
          const delay = RETRY_DELAY_MS * Math.pow(2, attempt - 1);
          await new Promise((resolve) => setTimeout(resolve, delay));
        }

        const result = await this.sendBatch(batch);
        batch.status = "completed";
        return result;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error("Unknown error");
        batch.status = "failed";
        batch.error_message = lastError.message;
        console.warn(
          `Batch ${batch.id} attempt ${attempt + 1}/${MAX_RETRY_ATTEMPTS} failed: ${lastError.message}`
        );
      }
    }

    batch.status = "failed";
    return {
      batch_id: batch.id,
      success: false,
      inserted: 0,
      updated: 0,
      failed: batch.records.length,
      errors: batch.records.map((record, index) => ({
        index: batch.start_index + index,
        student_id: record.student_id,
        assessment_id: record.assessment_id,
        reason: batch.error_message || "Max retry attempts exceeded",
      })),
    };
  }

  // ✅ UPDATED: Explicitly pass Authorization header with JWT
  private async sendBatch(batch: SyncBatch): Promise<SyncBatchResult> {
    const payload = {
      scores: batch.records.map((record) => ({
        student_id: record.student_id,
        assessment_id: record.assessment_id,
        score: record.score,
      })),
    };

    // Get the current session token explicitly
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;

    if (!token) {
      throw new Error("No valid session token found. Please log in again.");
    }

    const { data, error } = await supabase.functions.invoke("scores-bulk", {
      body: payload,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (error) throw new Error(error.message);

    const adjustedErrors = (data?.errors || []).map((err: any) => ({
      ...err,
      index: batch.start_index + (err.index ?? 0),
    }));

    return {
      batch_id: batch.id,
      success: (data?.failed ?? 0) === 0,
      inserted: data?.inserted ?? 0,
      updated: data?.updated ?? 0,
      failed: data?.failed ?? 0,
      errors: adjustedErrors,
    };
  }

  private updateLocalStorageAfterBatch(batch: SyncBatch, result: SyncBatchResult): void {
    const failedKeys = new Set(
      result.errors.map((e) => `${e.student_id}:${e.assessment_id}`)
    );

    for (const record of batch.records) {
      const recordKey = `${record.student_id}:${record.assessment_id}`;
      const failed = failedKeys.has(recordKey);

      if (!failed) {
        markScoreAsSynced(this.classId, record.student_id, record.assessment_id);
      }
    }

    // Update sync metadata (attempts + errors) on remaining records
    const cache = getScoresForClass(this.classId);
    if (!cache) return;

    for (const record of cache.scores) {
      const recordKey = `${record.student_id}:${record.assessment_id}`;
      const wasInBatch = batch.records.some(
        (r) => r.student_id === record.student_id && r.assessment_id === record.assessment_id
      );
      if (!wasInBatch) continue;

      const failed = failedKeys.has(recordKey);
      record.sync_attempts = (record.sync_attempts || 0) + 1;
      if (failed) {
        const err = result.errors.find(
          (e) => e.student_id === record.student_id && e.assessment_id === record.assessment_id
        );
        record.last_sync_error = err?.reason || "Unknown error";
      } else {
        record.last_sync_error = undefined;
      }
    }

    saveScoresForClass(this.classId, cache);
  }

  private cleanupSyncedRecords(): void {
    clearSyncedScores(this.classId);
  }

  private emitProgress(progress: SyncProgress): void {
    this.onProgress?.(progress);
  }

  abort(): void {
    this.abortController?.abort();
  }

  get active(): boolean {
    return this.isSyncing;
  }
}

// ── Backward-compatible wrapper ──────────────────────────────────────────

export async function syncScoresForClass(classId: string): Promise<SyncResponse> {
  const orchestrator = new SyncOrchestrator(classId);
  const result = await orchestrator.sync();
  return {
    success: result.success,
    inserted: result.inserted,
    updated: result.updated,
    failed: result.failed,
    errors: result.errors,
  };
} 