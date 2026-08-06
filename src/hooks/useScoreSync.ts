"use client";

import { useState, useCallback, useRef } from "react";
import { SyncOrchestrator } from "@/lib/sync/orchestrator";
import type { SyncProgress } from "@/lib/sync/orchestrator";
import { getPendingCountForClass } from "@/lib/storage/scores";
import { useToast } from "@/components/ui/use-toast";

export function useScoreSync(classId: string) {
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);
  const [pendingCount, setPendingCount] = useState(0);
  const [progress, setProgress] = useState<SyncProgress | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const syncInProgress = useRef(false);
  const orchestratorRef = useRef<SyncOrchestrator | null>(null);

  const refreshPendingCount = useCallback(() => {
    setPendingCount(getPendingCountForClass(classId));
  }, [classId]);

  const sync = useCallback(async () => {
    if (syncInProgress.current) return;
    syncInProgress.current = true;
    setIsSyncing(true);
    setProgress(null);
    setError(null);

    const orchestrator = new SyncOrchestrator(classId, (p) => setProgress(p));
    orchestratorRef.current = orchestrator;

    try {
      const result = await orchestrator.sync();

      if (result.success) {
        if (result.inserted > 0 || result.updated > 0) {
          setLastSyncTime(new Date().toISOString());
          refreshPendingCount();
          toast({
            title: "Sync Complete",
            description: `Inserted: ${result.inserted}, Updated: ${result.updated}`,
            variant: "default",
          });
        }
      } else if (result.failed > 0) {
        toast({
          title: "Partial Sync",
          description: `${result.failed} records failed. They remain saved locally.`,
          variant: "destructive",
        });
        refreshPendingCount();
      }

      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Sync failed";
      setError(message);
      toast({
        title: "Sync Failed",
        description: "Check your connection and try again. All data is safe locally.",
        variant: "destructive",
      });
      throw err;
    } finally {
      setIsSyncing(false);
      syncInProgress.current = false;
      orchestratorRef.current = null;
    }
  }, [classId, refreshPendingCount, toast]);

  const abort = useCallback(() => {
    orchestratorRef.current?.abort();
    toast({
      title: "Sync Cancelled",
      description: "Synced records have been saved. Remaining data stays local.",
    });
  }, [toast]);

  return {
    sync,
    abort,
    isSyncing,
    lastSyncTime,
    pendingCount,
    progress,
    error,
    refreshPendingCount,
  };
}
