'use client';

import { useState } from 'react';
import { useSubscription } from '@/hooks/useSubscription';
import { SubscriptionStatusView } from '@/components/subscription/SubscriptionStatus';
import { PricingCard } from '@/components/subscription/PricingCard';
import { SUBSCRIPTION_PLANS } from '@/lib/paystack/plans';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';
import type { BillingCycle } from '@/types/subscription';

export default function BillingPage() {
  const {
    status,
    history,
    isLoading,
    error,
    subscribeAndRedirect,
    upgradeAndRedirect,
    cancelSubscription,
  } = useSubscription();
  const { toast } = useToast();
  const [actionLoading, setActionLoading] = useState(false);
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('term');

  const hasPaidPlan =
    !!status && status.tier !== 'free' && status.tier !== 'trial';

  const handleChoosePlan = async (planKey: string) => {
    setActionLoading(true);
    try {
      if (hasPaidPlan) {
        await upgradeAndRedirect(planKey, billingCycle);
      } else {
        await subscribeAndRedirect(planKey, billingCycle);
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Something went wrong';
      toast({ title: 'Error', description: message, variant: 'destructive' });
      setActionLoading(false);
    }
  };

  const handleCancel = async () => {
    setActionLoading(true);
    try {
      await cancelSubscription();
      toast({ title: 'Subscription cancelled' });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Something went wrong';
      toast({ title: 'Error', description: message, variant: 'destructive' });
    } finally {
      setActionLoading(false);
    }
  };

  const scrollToPlans = () => {
    document
      .getElementById('billing-plans')
      ?.scrollIntoView({ behavior: 'smooth' });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold">Billing &amp; Subscription</h1>
        <p className="text-sm text-muted-foreground">
          Manage your school&apos;s plan and view payment history.
        </p>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      {status && (
        <SubscriptionStatusView
          status={status}
          onUpgrade={scrollToPlans}
          onCancel={handleCancel}
          isLoading={actionLoading}
        />
      )}

      <div id="billing-plans" className="space-y-4 scroll-mt-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">
            {hasPaidPlan ? 'Change Plan' : 'Choose a Plan'}
          </h2>
          <div className="inline-flex rounded-lg border p-1 bg-gray-50">
            <button
              onClick={() => setBillingCycle('term')}
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
                billingCycle === 'term'
                  ? 'bg-white shadow-sm text-gray-900'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Per Term
            </button>
            <button
              onClick={() => setBillingCycle('session')}
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
                billingCycle === 'session'
                  ? 'bg-white shadow-sm text-gray-900'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Per Session
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Object.entries(SUBSCRIPTION_PLANS).map(([key, plan]) => (
            <PricingCard
              key={key}
              name={plan.name}
              price={plan.price}
              sessionPrice={plan.session_price}
              billingCycle={billingCycle}
              students={plan.students}
              staff={plan.staff}
              features={plan.features}
              isCurrent={status?.tier === key}
              onSubscribe={() => handleChoosePlan(key)}
              isLoading={actionLoading}
            />
          ))}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Payment History</CardTitle>
        </CardHeader>
        <CardContent>
          {history.length === 0 ? (
            <p className="text-sm text-muted-foreground">No payments yet.</p>
          ) : (
            <div className="divide-y">
              {history.map((entry) => (
                <div
                  key={entry.id}
                  className="flex items-center justify-between py-3 text-sm"
                >
                  <div>
                    <p className="font-medium capitalize">
                      {entry.plan}
                      {entry.billing_cycle && (
                        <span className="text-gray-400 font-normal ml-2">
                          (per{' '}
                          {entry.billing_cycle === 'session'
                            ? 'session'
                            : 'term'})
                        </span>
                      )}
                    </p>
                    <p className="text-muted-foreground">
                      {new Date(entry.created_at).toLocaleDateString()} ·{' '}
                      {entry.reference}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">
                      ₦{entry.amount.toLocaleString()}
                    </p>
                    <p
                      className={
                        entry.status === 'success'
                          ? 'text-green-600'
                          : entry.status === 'failed'
                          ? 'text-red-600'
                          : 'text-muted-foreground'
                      }
                    >
                      {entry.status}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
