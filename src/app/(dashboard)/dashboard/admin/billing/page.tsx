'use client';

import { useState } from 'react';
import { useSubscription } from '@/hooks/useSubscription';
import { SubscriptionStatusView } from '@/components/subscription/SubscriptionStatus';
import { PricingCard } from '@/components/subscription/PricingCard';
import { SUBSCRIPTION_PLANS } from '@/lib/paystack/plans';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';

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

  // A school on a purchased plan that is currently active/expired uses the
  // "upgrade" flow; anyone still on free/trial uses the initial subscribe flow.
  const hasPaidPlan =
    !!status && status.tier !== 'free' && status.tier !== 'trial';

  const handleChoosePlan = async (planKey: string) => {
    setActionLoading(true);
    try {
      if (hasPaidPlan) {
        await upgradeAndRedirect(planKey);
      } else {
        await subscribeAndRedirect(planKey);
      }
      // On success the browser is redirected to Paystack, so we don't reset
      // loading here — it stays disabled until navigation occurs.
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Something went wrong';
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
      const message = err instanceof Error ? err.message : 'Something went wrong';
      toast({ title: 'Error', description: message, variant: 'destructive' });
    } finally {
      setActionLoading(false);
    }
  };

  // "Upgrade" from the status card just scrolls the user to the plan grid.
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
        <h2 className="text-lg font-semibold">
          {hasPaidPlan ? 'Change Plan' : 'Choose a Plan'}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Object.entries(SUBSCRIPTION_PLANS).map(([key, plan]) => (
            <PricingCard
              key={key}
              name={plan.name}
              price={plan.price}
              period={plan.period}
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
                    <p className="font-medium capitalize">{entry.plan}</p>
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
