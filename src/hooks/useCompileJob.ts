'use client';

import { useState, useCallback } from 'react';

interface CompileJob {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  error_message?: string;
}

interface UseCompileJobReturn {
  job: CompileJob | null;
  isLoading: boolean;
  error: string | null;
  triggerCompilation: (classId: string, termId: string) => Promise<void>;
  reset: () => void;
}

export function useCompileJob(): UseCompileJobReturn {
  const [job, setJob] = useState<CompileJob | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(null);

  const pollJob = useCallback(async (jobId: string) => {
    try {
      const response = await fetch(`/api/jobs/${jobId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch job status');
      }
      const data = await response.json();
      setJob(data);

      if (data.status === 'completed' || data.status === 'failed') {
        if (pollingInterval) {
          clearInterval(pollingInterval);
          setPollingInterval(null);
        }
        setIsLoading(false);
      }
    } catch (err) {
      console.error('Error polling job:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch job status');
      if (pollingInterval) {
        clearInterval(pollingInterval);
        setPollingInterval(null);
      }
      setIsLoading(false);
    }
  }, [pollingInterval]);

  const triggerCompilation = useCallback(async (classId: string, termId: string) => {
    setIsLoading(true);
    setError(null);
    setJob(null);

    try {
      const response = await fetch('/api/admin/compile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ class_id: classId, term_id: termId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to start compilation');
      }

      const data = await response.json();
      setJob({
        id: data.job_id,
        status: data.status,
        progress: 0,
      });

      // Start polling
      const interval = setInterval(() => {
        pollJob(data.job_id);
      }, 2000);

      setPollingInterval(interval);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      setIsLoading(false);
    }
  }, [pollJob]);

  const reset = useCallback(() => {
    if (pollingInterval) {
      clearInterval(pollingInterval);
      setPollingInterval(null);
    }
    setJob(null);
    setIsLoading(false);
    setError(null);
  }, [pollingInterval]);

  return {
    job,
    isLoading,
    error,
    triggerCompilation,
    reset,
  };
}
