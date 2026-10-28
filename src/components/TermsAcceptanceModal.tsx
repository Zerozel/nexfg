// src/components/TermsAcceptanceModal.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import {
  LoaderCircle,
  ScrollText,
  ArrowLeft,
  FileText,
  Shield,
} from 'lucide-react';

interface TermsStatus {
  version: string;
  effective_date: string | null;
  accepted: boolean;
}

type View = 'summary' | 'terms' | 'privacy';

export function TermsAcceptanceModal() {
  const { toast } = useToast();
  const [status, setStatus] = useState<TermsStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [checked, setChecked] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [view, setView] = useState<View>('summary');

  const fetchStatus = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/terms/current');
      if (!res.ok) return;
      const data = await res.json();
      setStatus(data);
    } catch {
      // silent
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  const handleAccept = async () => {
    if (!checked || !status) return;
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/terms/accept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ version: status.version }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || 'Failed to record acceptance');
      }
      toast({
        title: 'Terms accepted',
        description: 'You can now continue using the platform.',
      });
      await fetchStatus();
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading || !status || status.accepted) return null;

  return (
    <Dialog open={true}>
      <DialogContent className="sm:max-w-[640px] p-0 [&>button]:hidden">
        <div className="flex flex-col max-h-[85vh]">
          {/* ── Header ── */}
          <div className="p-5 border-b">
            {view === 'summary' ? (
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 flex-shrink-0">
                  <ScrollText className="h-5 w-5 text-green-700" />
                </div>
                <div>
                  <DialogTitle className="text-lg font-semibold text-gray-900">
                    Terms &amp; Conditions
                  </DialogTitle>
                  <p className="text-xs text-gray-500">
                    Version {status.version}
                  </p>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setView('summary')}
                className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-2"
              >
                <ArrowLeft className="mr-1 h-4 w-4" />
                Back to acceptance
              </button>
            )}
            {view === 'terms' && (
              <DialogTitle className="text-lg font-semibold text-gray-900 mt-1">
                Terms &amp; Conditions
              </DialogTitle>
            )}
            {view === 'privacy' && (
              <DialogTitle className="text-lg font-semibold text-gray-900 mt-1">
                Privacy Policy
              </DialogTitle>
            )}
          </div>

          {/* ── Body ── */}
          <div className="p-5 overflow-y-auto flex-1">
            {view === 'summary' && (
              <div className="space-y-4">
                <p className="text-sm text-gray-600">
                  Please review and accept the NexaForge Terms &amp; Conditions
                  and Privacy Policy before continuing.
                </p>

                <div className="p-3 rounded-lg bg-gray-50 border text-xs text-gray-700">
                  <p className="font-medium mb-2">Key terms:</p>
                  <ul className="space-y-1 list-disc list-inside">
                    <li>Your school is responsible for the data entered.</li>
                    <li>
                      Offline-entered scores must be synchronised; unsynchronised
                      scores can be lost.
                    </li>
                    <li>
                      Verify assessment weightings and totals before
                      distributing report cards.
                    </li>
                    <li>
                      School data retained for 90 days after subscription
                      expiry.
                    </li>
                  </ul>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    onClick={() => setView('terms')}
                    className="flex items-center gap-2 p-3 border rounded-lg hover:bg-gray-50 text-left transition-colors"
                  >
                    <FileText className="h-5 w-5 text-green-700 flex-shrink-0" />
                    <div>
                      <div className="font-medium text-sm text-gray-900">
                        Read Terms
                      </div>
                      <div className="text-xs text-gray-500">
                        Full legal agreement
                      </div>
                    </div>
                  </button>
                  <button
                    onClick={() => setView('privacy')}
                    className="flex items-center gap-2 p-3 border rounded-lg hover:bg-gray-50 text-left transition-colors"
                  >
                    <Shield className="h-5 w-5 text-green-700 flex-shrink-0" />
                    <div>
                      <div className="font-medium text-sm text-gray-900">
                        Read Privacy Policy
                      </div>
                      <div className="text-xs text-gray-500">
                        How we handle your data
                      </div>
                    </div>
                  </button>
                </div>

                <div className="flex items-start gap-3 pt-2 border-t">
                  <Checkbox
                    id="accept-terms"
                    checked={checked}
                    onCheckedChange={(v) => setChecked(v === true)}
                    className="mt-0.5 flex-shrink-0"
                  />
                  <Label
                    htmlFor="accept-terms"
                    className="text-sm leading-relaxed cursor-pointer"
                  >
                    I have read and agree to the NexaForge Terms &amp;
                    Conditions and Privacy Policy (Version {status.version}
                    {status.effective_date
                      ? `, effective ${new Date(
                          status.effective_date
                        ).toLocaleDateString('en-GB', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })}`
                      : ''}
                    ).
                  </Label>
                </div>
              </div>
            )}

            {view === 'terms' && <TermsContent />}
            {view === 'privacy' && <PrivacyContent />}
          </div>

          {/* ── Footer ── */}
          <div className="p-4 border-t bg-white">
            {view === 'summary' ? (
              <Button
                onClick={handleAccept}
                disabled={!checked || isSubmitting}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                {isSubmitting ? (
                  <>
                    <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                    Recording acceptance…
                  </>
                ) : (
                  'I Accept'
                )}
              </Button>
            ) : (
              <Button
                onClick={() => setView('summary')}
                variant="outline"
                className="w-full"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to acceptance
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* ════════════════════════════════════════════════════════════════════════
   Terms content — embedded inside the modal so we never navigate away.
   If you update the /terms page, mirror the changes here.
   ════════════════════════════════════════════════════════════════════════ */

function TermsContent() {
  return (
    <div className="prose prose-sm max-w-none text-gray-800 space-y-6">
      <div className="bg-amber-50 border border-amber-200 rounded p-3 text-xs text-amber-900">
        <strong>Draft — pending business registration.</strong> The Nexa Verse
        is in the process of company registration in Nigeria. This document is
        provided for review and agreement in principle.
      </div>

      <section>
        <h2 className="text-base font-bold text-gray-900 mb-2">
          1. What this agreement is
        </h2>
        <p className="text-sm mb-2">
          These Terms govern your school&apos;s use of the NexaForge school
          management platform. By creating an account, paying a subscription
          fee, or using the platform, the school agrees to these Terms.
        </p>
        <p className="text-sm">
          These Terms are between <strong>The Nexa Verse</strong> (operating
          under the brand <strong>NexaForge</strong>) and the{' '}
          <strong>school</strong> as an organisation.
        </p>
      </section>

      <section>
        <h2 className="text-base font-bold text-gray-900 mb-2">
          3. Accounts and security
        </h2>
        <ul className="text-sm list-disc list-inside space-y-1">
          <li>
            The School is responsible for all activity under its accounts.
          </li>
          <li>
            Each User must have their own account. Sharing logins is
            prohibited.
          </li>
          <li>
            Notify us immediately of any suspected unauthorised access.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-base font-bold text-gray-900 mb-2">
          5.1 Verification of results — important
        </h2>
        <p className="text-sm">
          The Platform calculates totals, grades and positions from the
          assessment configuration the School sets. The School is responsible
          for confirming that its assessment configuration is correct before
          distributing results. We strongly recommend printing and checking
          one report card before printing in bulk.
        </p>
      </section>

      <section>
        <h2 className="text-base font-bold text-gray-900 mb-2">
          8. Offline score entry
        </h2>
        <div className="border-l-4 border-amber-500 bg-amber-50 p-3 text-sm">
          <p className="mb-2">
            Scores entered without an internet connection are stored locally
            on the User&apos;s own device until synchronised.
          </p>
          <p className="mb-2">
            <strong>
              Until a score is successfully synchronised, it is not held by us
              and cannot be recovered by us.
            </strong>
          </p>
          <p>
            The School is responsible for ensuring Users synchronise their
            entries promptly.
          </p>
        </div>
      </section>

      <section>
        <h2 className="text-base font-bold text-gray-900 mb-2">
          11. Data protection
        </h2>
        <p className="text-sm">
          The School is the data controller of student, parent and staff
          personal data. The Nexa Verse is the data processor, acting on the
          School&apos;s instructions. The School&apos;s data belongs to the
          School. We do not sell it and do not use it for advertising.
        </p>
      </section>

      <section>
        <h2 className="text-base font-bold text-gray-900 mb-2">
          15. Contact
        </h2>
        <p className="text-sm">
          Support:{' '}
          <a
            href="mailto:support@nexaforges.me"
            className="text-green-700 underline"
          >
            support@nexaforges.me
          </a>
          <br />
          WhatsApp: 09045955670
        </p>
      </section>

      <p className="text-xs text-gray-500 border-t pt-4">
        For the full, authoritative Terms &amp; Conditions, see the public page
        at <code className="text-xs bg-gray-100 px-1 rounded">/terms</code>.
        This summary is provided for convenience within the modal.
      </p>
    </div>
  );
}

function PrivacyContent() {
  return (
    <div className="prose prose-sm max-w-none text-gray-800 space-y-6">
      <div className="bg-amber-50 border border-amber-200 rounded p-3 text-xs text-amber-900">
        <strong>Draft — pending business registration.</strong>
      </div>

      <section>
        <h2 className="text-base font-bold text-gray-900 mb-2">In short</h2>
        <ul className="text-sm list-disc list-inside space-y-1">
          <li>Schools use NexaForge to manage student records and results.</li>
          <li>
            The school decides what data is collected. We process it on the
            school&apos;s behalf.
          </li>
          <li>
            <strong>We do not sell your data.</strong> We do not advertise.
          </li>
          <li>Data is encrypted in transit and at rest, and backed up daily.</li>
        </ul>
      </section>

      <section>
        <h2 className="text-base font-bold text-gray-900 mb-2">
          1. Who we are and our role
        </h2>
        <p className="text-sm mb-2">
          NexaForge is a school management platform operated by{' '}
          <strong>The Nexa Verse</strong>, Nigeria.
        </p>
        <p className="text-sm">
          For student, parent/guardian and staff data entered by a school:{' '}
          <strong>the school is the controller</strong> and{' '}
          <strong>The Nexa Verse is the processor</strong>.
        </p>
      </section>

      <section>
        <h2 className="text-base font-bold text-gray-900 mb-2">
          2. What we collect
        </h2>
        <ul className="text-sm list-disc list-inside space-y-1">
          <li>Student identity, contact, guardian and academic records</li>
          <li>Staff name, email, role, and encrypted password</li>
          <li>School name, address, logo, subscription status</li>
          <li>
            Login records (12 months), technical logs (90 days), locally stored
            score entries (until synchronised)
          </li>
        </ul>
        <p className="text-sm mt-2">
          <strong>We do not store card details.</strong> Payments are handled
          entirely by Paystack.
        </p>
      </section>

      <section>
        <h2 className="text-base font-bold text-gray-900 mb-2">
          3. Children&apos;s data
        </h2>
        <ul className="text-sm list-disc list-inside space-y-1">
          <li>The school is the controller and responsible for lawful basis.</li>
          <li>
            The school must inform parents and guardians that it uses NexaForge.
          </li>
          <li>
            <strong>We never contact students directly.</strong> Students have
            no login.
          </li>
          <li>
            <strong>We do not publish student names or results</strong> on
            public school websites.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-base font-bold text-gray-900 mb-2">
          6. Who can see the data
        </h2>
        <p className="text-sm mb-2">Within a school:</p>
        <ul className="text-sm list-disc list-inside space-y-1">
          <li>Admin / Principal — all of that school&apos;s data</li>
          <li>Teacher — only their assigned classes and subjects</li>
        </ul>
        <p className="text-sm mt-2">
          <strong>One school can never see another school&apos;s data.</strong>{' '}
          Separation is enforced at the application and database level.
        </p>
      </section>

      <section>
        <h2 className="text-base font-bold text-gray-900 mb-2">
          9. Your rights
        </h2>
        <p className="text-sm">
          Under the NDPA you have the right to access, rectify, erase, restrict,
          port, object, withdraw consent, and complain to the NDPC. If you are a
          parent, guardian, student or member of staff, contact your school
          first. If you are a school, email{' '}
          <a
            href="mailto:support@nexaforges.me"
            className="text-green-700 underline"
          >
            support@nexaforges.me
          </a>
          .
        </p>
      </section>

      <section>
        <h2 className="text-base font-bold text-gray-900 mb-2">
          11. Offline score entry
        </h2>
        <div className="border-l-4 border-amber-500 bg-amber-50 p-3 text-sm">
          <p className="mb-2">
            Scores you enter are saved in your browser&apos;s local storage on
            your own device until you synchronise them.
          </p>
          <p>
            <strong>
              Until synchronised, that data is on your device only and cannot
              be recovered by us.
            </strong>{' '}
            Please synchronise at the end of each day.
          </p>
        </div>
      </section>

      <section>
        <h2 className="text-base font-bold text-gray-900 mb-2">
          13. Contact us
        </h2>
        <p className="text-sm">
          Data protection enquiries:{' '}
          <a
            href="mailto:support@nexaforges.me"
            className="text-green-700 underline"
          >
            support@nexaforges.me
          </a>
          <br />
          WhatsApp: 09045955670
        </p>
      </section>

      <p className="text-xs text-gray-500 border-t pt-4">
        For the full Privacy Policy, see the public page at{' '}
        <code className="text-xs bg-gray-100 px-1 rounded">/privacy</code>.
      </p>
    </div>
  );
}
