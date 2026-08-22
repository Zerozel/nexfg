'use client';

import { useState, useEffect, useCallback } from 'react';
import type { AcademicYear } from '@/types/admin';

// Fetches the school's academic years (sessions). The GET endpoint guarantees a
// current session exists, so `data` is never empty for an onboarded school.
export function useAcademicYears() {
  const [data, setData] = useState<AcademicYear[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAcademicYears = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/admin/academic-years');
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Failed to fetch academic years');
      }
      const result = await response.json();
      setData(result.data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAcademicYears();
  }, [fetchAcademicYears]);

  return { data, isLoading, error, refetch: fetchAcademicYears };
}

export function useAcademicYearMutations() {
  const createAcademicYear = async (payload: Partial<AcademicYear>) => {
    const response = await fetch('/api/admin/academic-years', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || 'Failed to create academic year');
    }
    return response.json();
  };

  const updateAcademicYear = async (id: string, payload: Partial<AcademicYear>) => {
    const response = await fetch(`/api/admin/academic-years/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || 'Failed to update academic year');
    }
    return response.json();
  };

  const deleteAcademicYear = async (id: string) => {
    const response = await fetch(`/api/admin/academic-years/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || 'Failed to delete academic year');
    }
    return response.json();
  };

  return { createAcademicYear, updateAcademicYear, deleteAcademicYear };
}
