'use client';

import { useState, useEffect, useCallback } from 'react';
import { SubscriptionStatus, PaymentHistoryEntry } from '@/types/subscription';

type BillingCycle = 'term' | 'session';

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
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : 'Failed to load subscription'
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchStatus();
  }, [fetchStatus]);

  // Kicks off Paystack checkout and hands back the hosted authorization URL.
  // The caller is responsible for redirecting the browser there.
  const initializePayment = async (
    plan: string,
    billingCycle: BillingCycle = 'term'
  ) => {
    const res = await fetch('/api/subscriptions/initialize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ plan, billing_cycle: billingCycle }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    return data as { authorization_url: string; reference: string };
  };

  const cancelSubscription = async () => {
    const res = await fetch('/api/subscriptions/cancel', { method: 'POST' });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    await fetchStatus();
    return data;
  };

  const upgradePlan = async (
    plan: string,
    billingCycle: BillingCycle = 'term'
  ) => {
    const res = await fetch('/api/subscriptions/upgrade', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ plan, billing_cycle: billingCycle }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    // NOTE: the tier does NOT change here — it changes only after Paystack
    // confirms payment via the webhook. Return the checkout URL so the caller
    // can redirect the user to complete payment.
    return data as { authorization_url: string; reference: string };
  };

  // Convenience helpers: start checkout for a (new or upgraded) plan and send
  // the browser straight to Paystack's hosted payment page.
  const subscribeAndRedirect = async (
    plan: string,
    billingCycle: BillingCycle = 'term'
  ) => {
    const { authorization_url } = await initializePayment(plan, billingCycle);
    if (authorization_url) window.location.href = authorization_url;
  };

  const upgradeAndRedirect = async (
    plan: string,
    billingCycle: BillingCycle = 'term'
  ) => {
    const { authorization_url } = await upgradePlan(plan, billingCycle);
    if (authorization_url) window.location.href = authorization_url;
  };

  return {
    status,
    history,
    isLoading,
    error,
    refetch: fetchStatus,
    initializePayment,
    cancelSubscription,
    upgradePlan,
    subscribeAndRedirect,
    upgradeAndRedirect,
  };
}
