"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useOnboarding } from "@/hooks/useOnboarding";
import { Rocket } from "lucide-react";

export function WelcomeDialog() {
  const { data, isLoading, markWelcomeSeen } = useOnboarding();
  const [dismissing, setDismissing] = useState(false);

  const shouldShow = !isLoading && !!data && !data.has_seen_welcome;

  const handleDismiss = async () => {
    setDismissing(true);
    await markWelcomeSeen();
    setDismissing(false);
  };

  if (!shouldShow) return null;

  return (
    <Dialog open onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto mb-3 h-12 w-12 rounded-full bg-amber-100 flex items-center justify-center">
            <Rocket className="h-6 w-6 text-amber-700" />
          </div>
          <DialogTitle className="text-center text-xl">
            Welcome to NexaForges
          </DialogTitle>
          <DialogDescription className="text-center">
            Let&apos;s set up your school in 5 quick steps. It takes about 15
            minutes.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-2 text-sm text-muted-foreground">
          <div className="flex items-start gap-2">
            <span className="text-amber-600 font-bold">1.</span>
            <span>Create your classes</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-amber-600 font-bold">2.</span>
            <span>Add subjects</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-amber-600 font-bold">3.</span>
            <span>Assign subjects to classes</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-amber-600 font-bold">4.</span>
            <span>Add teachers</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-amber-600 font-bold">5.</span>
            <span>Add students</span>
          </div>
        </div>

        <DialogFooter className="flex-col-reverse sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={handleDismiss}
            disabled={dismissing}
            className="w-full sm:w-auto"
          >
            I&apos;ll Do It Later
          </Button>
          <Link
            href="/dashboard/admin/classes"
            onClick={handleDismiss}
            className="inline-flex items-center justify-center rounded-md bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-4 py-2 text-sm font-medium w-full sm:w-auto"
          >
            Start Setup
          </Link>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
