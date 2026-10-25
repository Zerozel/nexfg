"use client";

import { useState, useEffect } from "react";
import { useInstallPrompt } from "@/hooks/useInstallPrompt";
import { Button } from "@/components/ui/button";
import { Download, X, Share } from "lucide-react";

const DISMISS_KEY = "nexaforge-install-dismissed";

export function InstallBanner() {
  const { deferredPrompt, isInstalled, promptInstall } = useInstallPrompt();
  const [isDismissed, setIsDismissed] = useState(true); // default hidden to avoid hydration mismatch
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Check dismissal
    const dismissed = localStorage.getItem(DISMISS_KEY);
    setIsDismissed(!!dismissed);

    // Check iOS
    const ios = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(ios);
  }, []);

  const handleDismiss = () => {
    localStorage.setItem(DISMISS_KEY, "true");
    setIsDismissed(true);
  };

  // Don't show if already installed, dismissed, or no prompt available (and not iOS)
  if (isInstalled || isDismissed) return null;
  if (!deferredPrompt && !isIOS) return null;

  return (
    <div className="bg-green-50 border-b border-green-200 px-4 py-2 flex items-center justify-between gap-3">
      <div className="flex items-center gap-2 text-sm text-green-900 min-w-0">
        <Download className="h-4 w-4 flex-shrink-0" />
        <span className="truncate">
          {isIOS
            ? "Install NexaForge: tap Share, then Add to Home Screen."
            : "Install NexaForge for faster access."}
        </span>
        {isIOS && <Share className="h-4 w-4 flex-shrink-0 inline" />}
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        {!isIOS && (
          <Button size="sm" variant="default" onClick={promptInstall}>
            Install
          </Button>
        )}
        <Button size="sm" variant="ghost" onClick={handleDismiss}>
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
