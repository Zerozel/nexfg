'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { SubscriptionStatus as Status } from '@/types/subscription';
import { Loader2 } from 'lucide-react';

interface SubscriptionStatusProps {
  status: Status;
  onUpgrade: () => void;
  onCancel: () => void;
  isLoading: boolean;
}

export function SubscriptionStatusView({ status, onUpgrade, onCancel, isLoading }: SubscriptionStatusProps) {
  const statusColors: Record<string, string> = {
    active: 'bg-green-100 text-green-700',
    trial: 'bg-yellow-100 text-yellow-700',
    inactive: 'bg-red-100 text-red-700',
    expired: 'bg-gray-100 text-gray-700',
  };

  const studentPercent = Math.min(100, Math.round((status.usage.students / (status.limits.students || 1)) * 100));
  const staffPercent = Math.min(100, Math.round((status.usage.staff / (status.limits.staff || 1)) * 100));

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader><CardTitle>Subscription</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">Status</span>
            <Badge className={statusColors[status.status]}>{status.status}</Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">Plan</span>
            <span className="font-medium capitalize">{status.tier}</span>
          </div>
          {status.expires_at && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Expires</span>
              <span className="font-medium">{new Date(status.expires_at).toLocaleDateString()}</span>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Usage</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-1"><span>Students</span><span>{status.usage.students} / {status.limits.students === Infinity ? '∞' : status.limits.students}</span></div>
            <Progress value={studentPercent} className="h-2" />
          </div>
          <div>
            <div className="flex justify-between text-sm mb-1"><span>Staff</span><span>{status.usage.staff} / {status.limits.staff === Infinity ? '∞' : status.limits.staff}</span></div>
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
          Upgrade Plan
        </Button>
      </div>
    </div>
  );
}
