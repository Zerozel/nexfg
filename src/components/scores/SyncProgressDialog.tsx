// components/scores/SyncProgressDialog.tsx

'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { SyncProgress } from '@/types/sync';
import { CheckCircle, XCircle, Loader2, AlertTriangle } from 'lucide-react';

interface SyncProgressDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  progress: SyncProgress | null;
  isSyncing: boolean;
  onCancel?: () => void;
}

export function SyncProgressDialog({
  open,
  onOpenChange,
  progress,
  isSyncing,
  onCancel,
}: SyncProgressDialogProps) {
  if (!progress && !isSyncing) return null;

  const safeProgress = progress || {
    total_records: 0,
    processed_records: 0,
    successful_records: 0,
    failed_records: 0,
    current_batch: 0,
    total_batches: 0,
    status: 'idle' as const,
  };

  const percentage = safeProgress.total_records > 0
    ? Math.round((safeProgress.processed_records / safeProgress.total_records) * 100)
    : 0;

  const getStatusIcon = () => {
    if (isSyncing) return <Loader2 className="w-10 h-10 animate-spin text-blue-500" />;
    if (safeProgress.status === 'completed' && safeProgress.failed_records === 0) {
      return <CheckCircle className="w-10 h-10 text-green-500" />;
    }
    if (safeProgress.status === 'completed' && safeProgress.failed_records > 0) {
      return <AlertTriangle className="w-10 h-10 text-amber-500" />;
    }
    if (safeProgress.status === 'failed') return <XCircle className="w-10 h-10 text-red-500" />;
    return <Loader2 className="w-10 h-10 text-gray-400" />;
  };

  const getStatusText = () => {
    if (isSyncing) return 'Syncing your changes...';
    if (safeProgress.status === 'completed' && safeProgress.failed_records === 0) {
      return 'Sync completed successfully!';
    }
    if (safeProgress.status === 'completed' && safeProgress.failed_records > 0) {
      return 'Sync completed with some errors';
    }
    if (safeProgress.status === 'failed') return 'Sync failed';
    return 'Preparing sync...';
  };

  const getStatusDescription = () => {
    if (isSyncing && safeProgress.total_batches > 1) {
      return `Processing batch ${safeProgress.current_batch} of ${safeProgress.total_batches}`;
    }
    if (safeProgress.status === 'completed' && safeProgress.failed_records > 0) {
      return `${safeProgress.failed_records} records failed. They will be retried on next sync.`;
    }
    return undefined;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Sync Progress</DialogTitle>
          {getStatusDescription() && (
            <DialogDescription>{getStatusDescription()}</DialogDescription>
          )}
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* Status Icon */}
          <div className="flex justify-center">
            {getStatusIcon()}
          </div>
          
          {/* Status Text */}
          <p className="text-center text-lg font-semibold">{getStatusText()}</p>
          
          {/* Progress Bar */}
          {safeProgress.total_records > 0 && (
            <div className="space-y-2">
              <Progress value={percentage} className="h-3" />
              <div className="flex justify-between text-sm text-gray-500">
                <span>{safeProgress.processed_records} of {safeProgress.total_records} records</span>
                <span className="font-medium">{percentage}%</span>
              </div>
            </div>
          )}

          {/* Stats Grid */}
          {safeProgress.total_records > 0 && (
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-3 rounded-lg bg-gray-50">
                <p className="text-xs text-gray-500 mb-1">Processed</p>
                <p className="text-lg font-bold">{safeProgress.processed_records}</p>
              </div>
              <div className="p-3 rounded-lg bg-green-50">
                <p className="text-xs text-green-600 mb-1">Synced</p>
                <p className="text-lg font-bold text-green-700">
                  {safeProgress.successful_records}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-red-50">
                <p className="text-xs text-red-600 mb-1">Failed</p>
                <p className="text-lg font-bold text-red-700">
                  {safeProgress.failed_records}
                </p>
              </div>
            </div>
          )}

          {/* Cancel Button */}
          {isSyncing && onCancel && (
            <div className="flex justify-center">
              <Button variant="outline" onClick={onCancel} className="w-full">
                Cancel Sync
              </Button>
            </div>
          )}

          {/* Close Button when done */}
          {!isSyncing && (
            <div className="flex justify-center">
              <Button 
                onClick={() => onOpenChange(false)} 
                className="w-full"
              >
                Close
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
