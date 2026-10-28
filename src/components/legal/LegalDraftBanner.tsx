// src/components/legal/LegalDraftBanner.tsx
import { AlertTriangle } from 'lucide-react';

export function LegalDraftBanner() {
  return (
    <div className="rounded-lg border border-amber-300 bg-amber-50 p-4 sm:p-5">
      <div className="flex items-start gap-3">
        <AlertTriangle className="h-5 w-5 text-amber-700 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-amber-900">
          <p className="font-semibold mb-1">Draft — Pending Business Registration</p>
          <p>
            <strong>The Nexa Verse</strong> is currently in the process of company
            registration in Nigeria. This document is provided for review and
            agreement in principle. It will be reissued with the registered company
            name, RC number, and registered address upon completion of registration.
            Until then, this document is not a legally executed agreement.
          </p>
        </div>
      </div>
    </div>
  );
}

export function LegalDraftFooter() {
  return (
    <footer className="mt-10 border-t pt-6 text-xs text-gray-500 space-y-2">
      <p>
        <strong>Version 1.0-draft</strong> · Effective pending business registration
        · Last updated {new Date().toLocaleDateString('en-GB', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        })}
      </p>
      <p>
        This document will be superseded by a formal version upon completion of
        The Nexa Verse&apos;s company registration. Schools and staff that have
        accepted the current draft will be given the formal version to accept
        before any fees become binding.
      </p>
      <p className="pt-2">
        The Nexa Verse ·{' '}
        <a href="mailto:support@nexaforges.me" className="text-green-700 underline">
          support@nexaforges.me
        </a>{' '}
        · WhatsApp 09045955670
      </p>
    </footer>
  );
}
