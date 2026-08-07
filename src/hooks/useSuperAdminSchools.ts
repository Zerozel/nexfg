'use client';

import { useState, useEffect, useCallback } from 'react';
import { SuperAdminSchool } from '@/types/super-admin';

interface UseSuperAdminSchoolsParams {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: string;
  tier?: string;
}

export function useSuperAdminSchools(params: UseSuperAdminSchoolsParams = {}) {
  const [data, setData] = useState<{ data: SuperAdminSchool[]; meta: any } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSchools = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const queryParams = new URLSearchParams();
      if (params.page) queryParams.set('page', params.page.toString());
      if (params.pageSize) queryParams.set('limit', params.pageSize.toString());
      if (params.search) queryParams.set('search', params.search);
      if (params.status) queryParams.set('status', params.status);
      if (params.tier) queryParams.set('tier', params.tier);

      const response = await fetch(`/api/super-admin/schools?${queryParams}`);
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Failed to fetch schools');
      }
      const result = await response.json();
      setData(result);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [params.page, params.pageSize, params.search, params.status, params.tier]);

  useEffect(() => {
    fetchSchools();
  }, [fetchSchools]);

  return { data, isLoading, error, refetch: fetchSchools };
}

export function useSuperAdminCreateSchool() {
  const [isLoading, setIsLoading] = useState(false);

  const createSchool = async (payload: Record<string, any>) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/super-admin/schools', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Failed to create school');
      }
      return response.json();
    } finally {
      setIsLoading(false);
    }
  };

  return { createSchool, isLoading };
}

export function useSuperAdminSchoolDetail(id: string) {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDetail = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/super-admin/schools/${id}`);
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Failed to fetch school details');
      }
      const result = await response.json();
      setData(result);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  return { data, isLoading, error, refetch: fetchDetail };
}
