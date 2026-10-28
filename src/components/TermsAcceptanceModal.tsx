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
      <DialogContent className="sm:max-w-[560px] p-0 [&>button]:hidden">
        <div className="flex flex-col max-h-[85vh]">
          {/* Header */}
          <div className="p-5 border-b">
            <div className="flex items-center gap-3 mb-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 flex-shrink-0">
                <ScrollText className="h-5 w-5 text-green-700" />
              </div>
              <div>
                <DialogTitle className="text-lg font-semibold text-gray-900">
                  Terms &amp; Conditions
                </DialogTitle>
                <DialogDescription className="text-xs text-gray-500">
                  Version {status.version}
                </DialogDescription>
              </div>
            </div>
            <p className="text-sm text-gray-600 mt-2">
              Please review and accept the NexaForge Terms &amp; Conditions and
              Privacy Policy before continuing.
            </p>
          </div>

          {/* Scrollable body */}
          <div className="p-5 space-y-4 overflow-y-auto flex-1">
            <div className="p-3 rounded-lg bg-gray-50 border text-xs text-gray-700">
              <p className="font-medium mb-2">Key terms:</p>
              <ul className="space-y-1 list-disc list-inside">
                <li>Your school is responsible for the data entered.</li>
                <li>
                  Offline-entered scores must be synchronised; unsynchronised
                  scores can be lost.
                </li>
                <li>
                  Verify assessment weightings and totals before distributing
                  report cards.
                </li>
                <li>School data retained for 90 days after subscription expiry.</li>
              </ul>
            </div>

            <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm">
              <Link
                href="/terms"
                className="text-green-700 hover:underline font-medium"
              >
                Read Terms &amp; Conditions →
              </Link>
              <Link
                href="/privacy"
                className="text-green-700 hover:underline font-medium"
              >
                Read Privacy Policy →
              </Link>
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
                I have read and agree to the NexaForge Terms &amp; Conditions and
                Privacy Policy (Version {status.version}
                {status.effective_date
                  ? `, effective ${new Date(status.effective_date).toLocaleDateString(
                      'en-GB',
                      { day: 'numeric', month: 'long', year: 'numeric' }
                    )}`
                  : ''}
                ).
              </Label>
            </div>
          </div>

          {/* Footer — Accept button always visible */}
          <div className="p-4 border-t bg-white">
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
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
