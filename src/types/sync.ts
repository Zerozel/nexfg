// types/sync.ts

export interface SyncRecord {
  id: string;
  student_id: string;
  assessment_id: string;
  score: number | null;
  synced: boolean;
  updated_at: string;
  sync_attempts?: number;
  last_sync_error?: string;
}

export interface SyncBatch {
  id: string;
  records: SyncRecord[];
  status: 'pending' | 'processing' | 'completed' | 'failed';
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
  status: 'idle' | 'syncing' | 'completed' | 'failed';
  start_time?: string;
  end_time?: string;
}

export interface SyncResult {
  success: boolean;
  inserted: number;
  updated: number;
  failed: number;
  total: number;
  errors: Array<{
    index: number;
    student_id: string;
    assessment_id: string;
    reason: string;
  }>;
  batch_results?: SyncBatchResult[];
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

export interface BulkScorePayload {
  scores: Array<{
    student_id: string;
    assessment_id: string;
    score: number | null;
  }>;
}

export interface BulkScoreResponse {
  success: boolean;
  inserted: number;
  updated: number;
  failed: number;
  total: number;
  errors: Array<{
    index: number;
    student_id: string;
    assessment_id: string;
    reason: string;
  }>;
}
