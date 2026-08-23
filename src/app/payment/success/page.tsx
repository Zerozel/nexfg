'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { CheckCircle, Loader2 } from 'lucide-react';

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const reference = searchParams.get('reference');
  const [verifying, setVerifying] = useState(true);

  useEffect(() => {
    // Paystack sends the user back here for BOTH successful and failed charges,
    // so confirm the real outcome before congratulating them. The webhook is
    // still the source of truth for activation; this only controls routing.
    if (!reference) {
      router.replace('/payment/failure');
      return;
    }

    let active = true;
    (async () => {
      try {
        const res = await fetch(
          `/api/subscriptions/verify?reference=${encodeURIComponent(reference)}`
        );
        const data = await res.json();
        if (!active) return;
        if (!res.ok || !data.success) {
          router.replace(`/payment/failure?reference=${reference}`);
          return;
        }
        setVerifying(false);
      } catch {
        if (active) router.replace(`/payment/failure?reference=${reference}`);
      }
    })();

    return () => {
      active = false;
    };
  }, [reference, router]);

  if (verifying) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-10 w-10 text-blue-500 mx-auto mb-4 animate-spin" />
          <p className="text-gray-500">Confirming your payment…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center max-w-md px-4">
        <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold mb-2">Payment Successful!</h1>
        <p className="text-gray-500 mb-6">Your subscription has been activated. You can now access all features.</p>
        {reference && <p className="text-sm text-gray-400 mb-6">Reference: {reference}</p>}
        <button onClick={() => router.push('/dashboard/admin/billing')} className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors">
          Go to Dashboard
        </button>
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-gray-50" />}>
      <PaymentSuccessContent />
    </Suspense>
  );
}
