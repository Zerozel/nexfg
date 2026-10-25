"use client";

import { useState, useEffect } from "react";

export function useInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // 1. Check if already installed
    const checkInstalled = () => {
      const standalone = window.matchMedia("(display-mode: standalone)").matches;
      const iosStandalone = (window.navigator as any).standalone === true;
      setIsInstalled(standalone || iosStandalone);
    };

    checkInstalled();
    window.matchMedia("(display-mode: standalone)").addEventListener("change", checkInstalled);

    // 2. Capture the prompt
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener("beforeinstallprompt", handler);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
      window.matchMedia("(display-mode: standalone)").removeEventListener("change", checkInstalled);
    };
  }, []);

  const promptInstall = async () => {
    if (!deferredPrompt) return null;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setDeferredPrompt(null);
    }
    return outcome;
  };

  return { deferredPrompt, isInstalled, promptInstall };
}
