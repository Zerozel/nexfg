'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { XCircle } from 'lucide-react';

function PaymentFailureContent() {
  const searchParams = useSearchParams();
  const reference = searchParams.get('reference');

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center max-w-md px-4">
        <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold mb-2">Payment Failed</h1>
        <p className="text-gray-500 mb-6">Your payment could not be processed. Please try again or contact support.</p>
        {reference && <p className="text-sm text-gray-400 mb-6">Reference: {reference}</p>}
        <a href="/support" className="text-blue-600 hover:underline">Contact Support</a>
      </div>
    </div>
  );
}

export default function PaymentFailurePage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-gray-50" />}>
      <PaymentFailureContent />
    </Suspense>
  );
}
