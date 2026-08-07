'use client';

import { useState, useEffect, useCallback } from 'react';
import { SubscriptionStatus, PaymentHistoryEntry } from '@/types/subscription';

export function useSubscription() {
  const [status, setStatus] = useState<SubscriptionStatus | null>(null);
  const [history, setHistory] = useState<PaymentHistoryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStatus = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [statusRes, historyRes] = await Promise.all([
        fetch('/api/subscriptions/status'),
        fetch('/api/subscriptions/history'),
      ]);
      const statusData = await statusRes.json();
      const historyData = await historyRes.json();
      if (statusData.success) setStatus(statusData.subscription);
      if (historyData.success) setHistory(historyData.history || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  const initializePayment = async (plan: string) => {
    const res = await fetch('/api/subscriptions/initialize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ plan }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    return data;
  };

  const cancelSubscription = async () => {
    const res = await fetch('/api/subscriptions/cancel', { method: 'POST' });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    await fetchStatus();
    return data;
  };

  const upgradePlan = async (plan: string) => {
    const res = await fetch('/api/subscriptions/upgrade', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ plan }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    await fetchStatus();
    return data;
  };

  return { status, history, isLoading, error, refetch: fetchStatus, initializePayment, cancelSubscription, upgradePlan };
}
