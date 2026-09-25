'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { SubscriptionStatus as Status } from '@/types/subscription';
import { Loader2, AlertTriangle } from 'lucide-react';

interface SubscriptionStatusProps {
  status: Status;
  onUpgrade: () => void;
  onCancel: () => void;
  isLoading: boolean;
}

export function SubscriptionStatusView({
  status,
  onUpgrade,
  onCancel,
  isLoading,
}: SubscriptionStatusProps) {
  const statusColors: Record<string, string> = {
    active: 'bg-green-100 text-green-700',
    trial: 'bg-yellow-100 text-yellow-700',
    inactive: 'bg-red-100 text-red-700',
    expired: 'bg-gray-100 text-gray-700',
  };

  const studentPercent = Math.min(
    100,
    Math.round((status.usage.students / (status.limits.students || 1)) * 100)
  );
  const staffPercent = Math.min(
    100,
    Math.round((status.usage.staff / (status.limits.staff || 1)) * 100)
  );

  const showExpiryWarning =
    status.days_until_expiry !== null &&
    status.days_until_expiry <= 14 &&
    status.status === 'active';

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Subscription</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">Status</span>
            <Badge className={statusColors[status.status]}>
              {status.status}
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">Plan</span>
            <span className="font-medium capitalize">{status.tier}</span>
          </div>
          {status.billing_cycle && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Billing</span>
              <span className="font-medium">
                Per {status.billing_cycle === 'session' ? 'session' : 'term'}
              </span>
            </div>
          )}
          {status.expires_at && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Expires</span>
              <span className="font-medium">
                {new Date(status.expires_at).toLocaleDateString()}
                {status.days_until_expiry !== null && (
                  <span
                    className={
                      status.days_until_expiry <= 14
                        ? 'text-amber-600 ml-2'
                        : 'text-gray-400 ml-2'
                    }
                  >
                    ({status.days_until_expiry} day
                    {status.days_until_expiry !== 1 ? 's' : ''}{' '}
                    {status.days_until_expiry < 0 ? 'ago' : 'left'})
                  </span>
                )}
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {showExpiryWarning && (
        <Card className="border-amber-300 bg-amber-50">
          <CardContent className="flex items-center gap-3 py-4">
            <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0" />
            <p className="text-sm text-amber-800">
              Your subscription expires in {status.days_until_expiry} day
              {status.days_until_expiry !== 1 ? 's' : ''}. Renew to avoid
              interruption.
            </p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Usage</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Students</span>
              <span>
                {status.usage.students} /{' '}
                {status.limits.students === Infinity
                  ? '∞'
                  : status.limits.students}
              </span>
            </div>
            <Progress value={studentPercent} className="h-2" />
          </div>
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Staff</span>
              <span>
                {status.usage.staff} /{' '}
                {status.limits.staff === Infinity ? '∞' : status.limits.staff}
              </span>
            </div>
            <Progress value={staffPercent} className="h-2" />
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-3">
        {status.status !== 'inactive' && (
          <Button variant="outline" onClick={onCancel} disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Cancel Subscription
          </Button>
        )}
        <Button onClick={onUpgrade} disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Change Plan
        </Button>
      </div>
    </div>
  );
}
