// components/scores/AutoSyncHandler.tsx
"use client";

import { useEffect, useRef } from "react";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import { useScoreSync } from "@/hooks/useScoreSync";

interface AutoSyncHandlerProps {
  classId: string;
  children: React.ReactNode;
}

export function AutoSyncHandler({
  classId,
  children,
}: AutoSyncHandlerProps) {
  const isOnline = useOnlineStatus();
  const { sync, pendingCount } = useScoreSync(classId);
  const wasOffline = useRef(false);
  const hasPendingRef = useRef(false);

  // Track if we had pending data while offline
  useEffect(() => {
    if (!isOnline && pendingCount > 0) {
      hasPendingRef.current = true;
    }
  }, [isOnline, pendingCount]);

  // Auto-sync when coming back online with pending data
  useEffect(() => {
    if (isOnline && wasOffline.current && hasPendingRef.current) {
      const timer = setTimeout(() => {
        sync();
        hasPendingRef.current = false;
      }, 2000);
      return () => clearTimeout(timer);
    }
    wasOffline.current = !isOnline;
  }, [isOnline, sync]);

  return <>{children}</>;
}
