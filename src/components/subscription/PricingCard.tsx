'use client';

import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';

interface PricingCardProps {
  name: string;
  price: number;
  sessionPrice?: number;
  /** Optional — defaults to 'term'. */
  billingCycle?: 'term' | 'session';
  /** Optional — falls back to the derived cycle label. Kept for legacy callers. */
  period?: string;
  students: string;
  staff: string;
  features: string[];
  isCurrent: boolean;
  primaryColor?: string;
  onSubscribe: () => void;
  isLoading?: boolean;
}

export function PricingCard({
  name,
  price,
  sessionPrice,
  billingCycle,
  period,
  students,
  staff,
  features,
  isCurrent,
  primaryColor = '#2563eb',
  onSubscribe,
  isLoading,
}: PricingCardProps) {
  const cycle = billingCycle ?? 'term';
  const displayed =
    cycle === 'session' && sessionPrice ? sessionPrice : price;
  const periodLabel = period ?? (cycle === 'session' ? 'session' : 'term');

  return (
    <div
      className={`relative rounded-2xl border p-6 flex flex-col ${
        isCurrent ? 'border-2 shadow-lg' : 'border-gray-200 shadow-sm'
      }`}
      style={isCurrent ? { borderColor: primaryColor } : {}}
    >
      {isCurrent && (
        <span
          className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-white text-xs font-medium"
          style={{ backgroundColor: primaryColor }}
        >
          Current Plan
        </span>
      )}
      <div className="mb-6">
        <h3 className="text-xl font-bold mb-1">{name}</h3>
        <div className="flex items-baseline gap-1">
          <span className="text-3xl font-bold">
            ₦{displayed.toLocaleString()}
          </span>
          <span className="text-gray-500">/{periodLabel}</span>
        </div>
        {cycle === 'term' && sessionPrice && (
          <p className="text-xs text-gray-400 mt-1">
            Or ₦{sessionPrice.toLocaleString()} per session (save ₦
            {(price * 3 - sessionPrice).toLocaleString()})
          </p>
        )}
        {cycle === 'session' && (
          <p className="text-xs text-gray-400 mt-1">Covers all three terms</p>
        )}
        <p className="text-sm text-gray-500 mt-2">
          {students} students · {staff} staff
        </p>
      </div>
      <ul className="space-y-3 mb-8 flex-1">
        {features.map((f) => (
          <li key={f} className="flex items-start gap-2 text-sm">
            <Check
              className="h-4 w-4 mt-0.5 flex-shrink-0"
              style={{ color: primaryColor }}
            />
            <span className="text-gray-600">{f}</span>
          </li>
        ))}
      </ul>
      <Button
        onClick={onSubscribe}
        disabled={isCurrent || isLoading}
        className="w-full"
        style={isCurrent ? {} : { backgroundColor: primaryColor }}
      >
        {isCurrent
          ? 'Current Plan'
          : isLoading
          ? 'Processing...'
          : 'Subscribe'}
      </Button>
    </div>
  );
}
