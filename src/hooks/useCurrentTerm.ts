// src/hooks/useCurrentTerm.ts
"use client";

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase/client';

export interface Term {
  id: string;
  school_id: string;
  academic_year_id: string;
  name: string;
  is_current: boolean;
  order: number | null;
}

/**
 * Fetch all terms for the current user's school, plus a convenience pointer to
 * the current term (is_current = true). Teachers use this to default their
 * score entry to the term they're in right now.
 */
export function useCurrentTerm() {
  const [terms, setTerms] = useState<Term[]>([]);
  const [currentTerm, setCurrentTerm] = useState<Term | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: { user } } = await supabase.auth.getUser();
      const schoolId = user?.app_metadata?.school_id;

      if (!schoolId) {
        setTerms([]);
        setCurrentTerm(null);
        setLoading(false);
        return;
      }

      const { data, error: fetchError } = await supabase
        .from('terms')
        .select('*')
        .eq('school_id', schoolId)
        .is('is_deleted', false)
        .order('order', { ascending: true });

      if (fetchError) throw fetchError;

      const allTerms = (data || []) as Term[];
      setTerms(allTerms);
      setCurrentTerm(allTerms.find((t) => t.is_current) || allTerms[0] || null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch terms');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { terms, currentTerm, loading, error, refetch };
}
