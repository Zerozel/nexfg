// lib/sync/batcher.ts

import { SyncRecord, SyncBatch } from '@/types/sync';

const MAX_BATCH_SIZE = 1000;

/**
 * Split records into batches of maximum 1000 records each
 * Each batch gets a unique ID for tracking
 */
export function splitIntoBatches(records: SyncRecord[]): SyncBatch[] {
  const batches: SyncBatch[] = [];
  const total = records.length;

  for (let i = 0; i < total; i += MAX_BATCH_SIZE) {
    const batchRecords = records.slice(i, i + MAX_BATCH_SIZE);
    batches.push({
      id: crypto.randomUUID(),
      records: batchRecords,
      status: 'pending',
      start_index: i,
      end_index: Math.min(i + MAX_BATCH_SIZE, total),
      attempt_count: 0,
    });
  }

  return batches;
}

/**
 * Filter out only unsynced records
 */
export function getPendingRecords(records: SyncRecord[]): SyncRecord[] {
  return records.filter(r => !r.synced);
}

/**
 * Filter records that have failed at least once
 */
export function getFailedRecords(records: SyncRecord[]): SyncRecord[] {
  return records.filter(r => !r.synced && (r.sync_attempts || 0) > 0);
}

/**
 * Calculate number of batches needed
 */
export function calculateBatchCount(totalRecords: number): number {
  return Math.ceil(totalRecords / MAX_BATCH_SIZE);
}
