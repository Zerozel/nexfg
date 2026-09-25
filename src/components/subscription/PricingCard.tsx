'use client';

import { Button } from '@/components/ui/button';
import { Check, Sparkles } from 'lucide-react';

interface PricingCardProps {
  name: string;
  price: number;
  sessionPrice?: number;
  billingCycle?: 'term' | 'session';
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
  const isSession = cycle === 'session' && !!sessionPrice;

  const displayed = isSession ? sessionPrice! : price;
  const periodLabel = period ?? (cycle === 'session' ? 'session' : 'term');

  // Only compute the discount when we have a session price.
  const fullSessionPrice = price * 3;
  const discount = sessionPrice ? fullSessionPrice - sessionPrice : 0;
  const discountPercent = sessionPrice
    ? Math.round((discount / fullSessionPrice) * 100)
    : 0;

  return (
    <div
      className={`relative rounded-2xl border p-6 flex flex-col bg-white ${
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

      {/* Discount badge — only shows in session mode when there's a saving */}
      {isSession && discount > 0 && (
        <span className="absolute -top-3 right-4 inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700 border border-green-200">
          <Sparkles className="h-3 w-3" />
          Save ₦{discount.toLocaleString()} ({discountPercent}%)
        </span>
      )}

      <div className="mb-6 pt-2">
        <h3 className="text-xl font-bold mb-1">{name}</h3>

        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold">
            ₦{displayed.toLocaleString()}
          </span>
          <span className="text-gray-500">/{periodLabel}</span>
        </div>

        {/* Session mode: show the original (3× term) price struck through */}
        {isSession && discount > 0 && (
          <p className="text-sm text-gray-400 mt-1">
            <span className="line-through">
              ₦{fullSessionPrice.toLocaleString()}
            </span>{' '}
            <span className="text-green-600 font-medium">
              · Covers all 3 terms
            </span>
          </p>
        )}

        {/* Term mode: tease the session discount */}
        {!isSession && sessionPrice && discount > 0 && (
          <p className="text-xs text-gray-500 mt-2">
            Or{' '}
            <strong className="text-gray-700">
              ₦{sessionPrice.toLocaleString()}/session
            </strong>{' '}
            —{' '}
            <span className="text-green-600 font-medium">
              save ₦{discount.toLocaleString()} ({discountPercent}%)
            </span>
          </p>
        )}

        <p className="text-sm text-gray-500 mt-3">
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
