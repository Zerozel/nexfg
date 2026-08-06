// hooks/useSyncProgress.ts

'use client';

import { useState, useCallback } from 'react';
import { SyncProgress } from '@/types/sync';

const initialProgress: SyncProgress = {
  status: 'idle',
  total_records: 0,
  processed_records: 0,
  successful_records: 0,
  failed_records: 0,
  current_batch: 0,
  total_batches: 0,
};

export function useSyncProgress() {
  const [progress, setProgress] = useState<SyncProgress>(initialProgress);
  const [isSyncing, setIsSyncing] = useState(false);

  const updateProgress = useCallback((newProgress: SyncProgress) => {
    setProgress(newProgress);
  }, []);

  const resetProgress = useCallback(() => {
    setProgress(initialProgress);
    setIsSyncing(false);
  }, []);

  const startSync = useCallback(() => {
    setIsSyncing(true);
    setProgress(prev => ({
      ...prev,
      status: 'syncing',
      start_time: new Date().toISOString(),
    }));
  }, []);

  const completeSync = useCallback(() => {
    setIsSyncing(false);
    setProgress(prev => ({
      ...prev,
      status: 'completed',
      end_time: new Date().toISOString(),
    }));
  }, []);

  const failSync = useCallback(() => {
    setIsSyncing(false);
    setProgress(prev => ({
      ...prev,
      status: 'failed',
      end_time: new Date().toISOString(),
    }));
  }, []);

  return {
    progress,
    isSyncing,
    updateProgress,
    resetProgress,
    startSync,
    completeSync,
    failSync,
  };
}
