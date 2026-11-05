// src/components/admin/school-settings/AssessmentStructureForm.tsx
'use client';

import { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import {
  CheckCircle2,
  AlertTriangle,
  BookOpen,
  Loader2,
} from 'lucide-react';

interface Props {
  currentCaCount: number;
  onUpdated: () => void;
}

export function AssessmentStructureForm({ currentCaCount, onUpdated }: Props) {
  const [pendingChoice, setPendingChoice] = useState<2 | 3 | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const target = pendingChoice;

  const handleConfirm = async () => {
    if (!target) return;
    setIsSaving(true);
    try {
      const res = await fetch('/api/admin/school/ca-count', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ca_count: target }),
      });
      const body = await res.json();
      if (!res.ok) {
        throw new Error(body.error || 'Failed to update assessment structure');
      }

      if (body.data.errors && body.data.errors.length > 0) {
        toast.warning(
          `Updated with ${body.data.errors.length} warning(s). Some classes may need review.`
        );
      } else {
        toast.success(body.message || 'Assessment structure updated');
      }

      setPendingChoice(null);
      onUpdated();
    } catch (err: any) {
      toast.error(err.message || 'Failed to update');
    } finally {
      setIsSaving(false);
    }
  };

  const isChanging = pendingChoice !== null && pendingChoice !== currentCaCount;
  const isSwitchingToThree = pendingChoice === 3;
  const isSwitchingToTwo = pendingChoice === 2;

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-green-700" />
            Assessment Structure
          </CardTitle>
          <CardDescription>
            Choose how continuous assessment is recorded for your school. This
            affects every class, every subject, and every term. You can change
            this at any time — existing scores are always preserved.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Option: 2 CAs */}
          <button
            type="button"
            onClick={() => setPendingChoice(2)}
            className={`w-full text-left p-4 rounded-lg border-2 transition-colors ${
              currentCaCount === 2
                ? 'border-green-500 bg-green-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-gray-900">
                    2 Continuous Assessments
                  </span>
                  {currentCaCount === 2 && (
                    <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Current
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-gray-600">
                  CA1 (15) + CA2 (15) + Exam (70) = <strong>100</strong>
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Simpler score sheets with fewer columns. Recommended for most
                  schools.
                </p>
              </div>
            </div>
          </button>

          {/* Option: 3 CAs */}
          <button
            type="button"
            onClick={() => setPendingChoice(3)}
            className={`w-full text-left p-4 rounded-lg border-2 transition-colors ${
              currentCaCount === 3
                ? 'border-green-500 bg-green-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-gray-900">
                    3 Continuous Assessments
                  </span>
                  {currentCaCount === 3 && (
                    <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Current
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-gray-600">
                  CA1 (10) + CA2 (10) + CA3 (10) + Exam (70) ={' '}
                  <strong>100</strong>
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  For schools that record three separate CA scores per subject.
                </p>
              </div>
            </div>
          </button>
        </CardContent>
      </Card>

      {/* Confirmation dialog */}
      <Dialog
        open={isChanging}
        onOpenChange={(open) => {
          if (!open) setPendingChoice(null);
        }}
      >
        <DialogContent className="sm:max-w-[540px]">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full flex-shrink-0 ${
                  isSwitchingToThree ? 'bg-amber-100' : 'bg-blue-100'
                }`}
              >
                {isSwitchingToThree ? (
                  <AlertTriangle className="h-5 w-5 text-amber-700" />
                ) : (
                  <CheckCircle2 className="h-5 w-5 text-blue-700" />
                )}
              </div>
              <DialogTitle className="text-lg">
                {isSwitchingToThree
                  ? 'Switch to 3 Continuous Assessments?'
                  : 'Switch to 2 Continuous Assessments?'}
              </DialogTitle>
            </div>
            <DialogDescription className="text-sm text-gray-600 leading-relaxed">
              {isSwitchingToThree ? (
                <>
                  You&apos;re about to add a <strong>CA3 column</strong> to
                  every class, every subject, and every term in your school.
                  <br />
                  <br />
                  If you switch back to 2 CAs later, any CA3 scores your
                  teachers entered will be{' '}
                  <strong>saved but hidden</strong> — not deleted. They&apos;ll
                  reappear the moment you switch to 3 CAs again.
                </>
              ) : (
                <>
                  You&apos;re about to <strong>hide the CA3 column</strong> from
                  every class, every subject, and every term in your school.
                  <br />
                  <br />
                  Any CA3 scores already entered will be{' '}
                  <strong>safely preserved</strong> — not deleted. They&apos;ll
                  simply stop appearing on score sheets and report cards until
                  you switch back to 3 CAs.
                </>
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="p-4 rounded-lg bg-blue-50 border border-blue-200 text-sm text-blue-900">
            <p className="font-medium mb-1">
              Your data is not being deleted.
            </p>
            <p className="text-blue-800">
              This is a reversible change. You can switch back at any time, and
              everything returns exactly as it was.
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="outline"
              onClick={() => setPendingChoice(null)}
              disabled={isSaving}
            >
              Keep current setup
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={isSaving}
              className={
                isSwitchingToThree
                  ? 'bg-amber-600 hover:bg-amber-700'
                  : 'bg-green-600 hover:bg-green-700'
              }
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating…
                </>
              ) : isSwitchingToThree ? (
                'Yes, add CA3'
              ) : (
                'Yes, switch to 2 CAs'
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
