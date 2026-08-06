"use client";

import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Wifi,
  WifiOff,
  CheckCircle2,
  AlertCircle,
  Loader2,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { SyncProgress } from "@/lib/sync/orchestrator";

interface SyncStatusBarProps {
  pendingCount: number;
  isSyncing: boolean;
  onSync?: () => void;
  onCancel?: () => void;
  lastSyncTime?: string | null;
  progress?: SyncProgress | null;
}

export function SyncStatusBar({
  pendingCount,
  isSyncing,
  onSync,
  onCancel,
  lastSyncTime,
  progress,
}: SyncStatusBarProps) {
  const isOnline = useOnlineStatus();

  const statusConfig = (() => {
    if (!isOnline) {
      return {
        icon: WifiOff,
        text: "Offline — data saved locally",
        badgeVariant: "destructive" as const,
        iconColor: "text-red-500",
      };
    }
    if (isSyncing) {
      const batchInfo =
        progress && progress.total_batches > 1
          ? `batch ${progress.current_batch}/${progress.total_batches}`
          : "";
      return {
        icon: Loader2,
        text: batchInfo ? `Syncing ${batchInfo}...` : "Syncing...",
        badgeVariant: "secondary" as const,
        iconColor: "text-green-600 animate-spin",
      };
    }
    if (pendingCount === 0) {
      return {
        icon: CheckCircle2,
        text: "All data synced",
        badgeVariant: "success" as const,
        iconColor: "text-green-600",
      };
    }
    return {
      icon: AlertCircle,
      text: `${pendingCount} pending update${pendingCount !== 1 ? "s" : ""}`,
      badgeVariant: "warning" as const,
      iconColor: "text-amber-600",
    };
  })();

  const Icon = statusConfig.icon;

  const progressPercent =
    progress && progress.total_records > 0
      ? Math.round((progress.processed_records / progress.total_records) * 100)
      : 0;

  return (
    <div className="space-y-2">
      {/* Main status bar */}
      <div className="flex items-center gap-3 px-4 py-2.5 bg-white rounded-lg border border-gray-200 shadow-sm">
        <Icon className={cn("h-4 w-4 shrink-0", statusConfig.iconColor)} />
        <span className="text-sm text-gray-600 truncate">{statusConfig.text}</span>

        {/* Record counter during sync */}
        {isSyncing && progress && progress.total_records > 0 && (
          <span className="text-xs text-gray-400 whitespace-nowrap">
            {progress.processed_records}/{progress.total_records}
          </span>
        )}

        <div className="flex items-center gap-2 ml-auto">
          {/* Sync button */}
          {isOnline && pendingCount > 0 && !isSyncing && onSync && (
            <Button
              size="sm"
              variant="default"
              onClick={onSync}
              className="ml-2"
            >
              Sync Now
            </Button>
          )}

          {/* Cancel button during sync */}
          {isSyncing && onCancel && (
            <Button
              size="sm"
              variant="outline"
              onClick={onCancel}
              className="ml-2"
            >
              <X className="mr-1 h-3 w-3" />
              Cancel
            </Button>
          )}

          {/* Last sync time */}
          {lastSyncTime && pendingCount === 0 && !isSyncing && (
            <span className="text-xs text-gray-400 ml-2 whitespace-nowrap">
              Last sync: {new Date(lastSyncTime).toLocaleTimeString()}
            </span>
          )}
        </div>
      </div>

      {/* Progress bar during sync */}
      {isSyncing && progress && progress.total_records > 0 && (
        <div className="px-1">
          <Progress value={progressPercent} className="h-2" />
          {progress.total_batches > 1 && (
            <p className="text-xs text-gray-400 mt-1">
              Batch {progress.current_batch} of {progress.total_batches}
              {progress.failed_records > 0 && (
                <span className="text-red-500 ml-2">
                  • {progress.failed_records} failed
                </span>
              )}
            </p>
          )}
        </div>
      )}

      {/* Sync results summary */}
      {!isSyncing &&
        progress &&
        progress.status === "completed" &&
        progress.total_records > 0 && (
          <div className="flex gap-3 px-1 text-xs">
            {progress.successful_records > 0 && (
              <span className="text-green-600 font-medium">
                ✓ {progress.successful_records} synced
              </span>
            )}
            {progress.failed_records > 0 && (
              <span className="text-red-600 font-medium">
                ✗ {progress.failed_records} failed
              </span>
            )}
          </div>
        )}
    </div>
  );
}
