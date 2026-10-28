// src/components/TermsAcceptanceModal.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { LoaderCircle, ScrollText } from 'lucide-react';

interface TermsStatus {
  version: string;
  effective_date: string | null;
  accepted: boolean;
}

export function TermsAcceptanceModal() {
  const { toast } = useToast();
  const [status, setStatus] = useState<TermsStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [checked, setChecked] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchStatus = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/terms/current');
      if (!res.ok) return;
      const data = await res.json();
      setStatus(data);
    } catch {
      // silent fail — modal won't show if the check fails
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
      <DialogContent
        className="sm:max-w-[560px] max-h-[90vh] overflow-y-auto [&>button]:hidden"
        // The [&>button]:hidden selector hides the dialog's built-in close
        // button. This makes the modal non-dismissible without relying on
        // props the dialog component doesn't expose.
      >
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
              <ScrollText className="h-5 w-5 text-green-700" />
            </div>
            <DialogTitle className="text-lg">Terms &amp; Conditions</DialogTitle>
          </div>
          <DialogDescription>
            Before you continue, please review and accept the NexaForge Terms
            &amp; Conditions and Privacy Policy. This applies to every staff
            member using the platform.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="p-4 rounded-lg bg-gray-50 border text-sm text-gray-700 max-h-56 overflow-y-auto">
            <p className="font-medium mb-2">Summary of key terms:</p>
            <ul className="space-y-1.5 list-disc list-inside text-xs">
              <li>
                You are using NexaForge on behalf of your school, and your
                school is responsible for the data entered.
              </li>
              <li>
                Scores entered offline are stored on your device until
                synchronised. Unsynchronised scores can be lost if you clear
                browser data or change devices.
              </li>
              <li>
                Verify assessment weightings and result totals before
                distributing report cards.
              </li>
              <li>
                Your school&apos;s data is retained for 90 days after
                subscription expiry, then may be deleted.
              </li>
              <li>The full Terms and Privacy Policy are linked below.</li>
            </ul>
          </div>

          <div className="flex flex-wrap gap-3 text-sm">
            <Link
              href="/terms"
              target="_blank"
              rel="noopener noreferrer"
              className="text-green-700 hover:underline font-medium"
            >
              Read Terms &amp; Conditions →
            </Link>
            <Link
              href="/privacy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-green-700 hover:underline font-medium"
            >
              Read Privacy Policy →
            </Link>
          </div>

          <div className="flex items-start gap-3 pt-2">
            <Checkbox
              id="accept-terms"
              checked={checked}
              onCheckedChange={(v) => setChecked(v === true)}
              className="mt-0.5"
            />
            <Label
              htmlFor="accept-terms"
              className="text-sm leading-relaxed cursor-pointer"
            >
              I have read and agree to the NexaForge Terms &amp; Conditions and
              Privacy Policy (Version {status.version}
              {status.effective_date
                ? `, effective ${new Date(status.effective_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}`
                : ''}
              ).
            </Label>
          </div>
        </div>

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
      </DialogContent>
    </Dialog>
  );
}
