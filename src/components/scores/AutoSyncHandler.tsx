// components/scores/AutoSyncHandler.tsx
"use client";

import { useEffect, useRef } from "react";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import { getPendingCountForClass } from "@/lib/storage/scores";

interface AutoSyncHandlerProps {
  classId: string;
  /**
   * Called ~2s after the connection is restored, but only if there is pending
   * (unsynced) data for the class. Wire this to the parent's `sync` so auto-sync
   * shares the same orchestrator/state as manual sync.
   */
  onReconnect: () => void;
  children: React.ReactNode;
}

export function AutoSyncHandler({
  classId,
  onReconnect,
  children,
}: AutoSyncHandlerProps) {
  const isOnline = useOnlineStatus();
  const wasOnline = useRef(isOnline);
  const onReconnectRef = useRef(onReconnect);

  // Keep the latest callback without making it an effect dependency (so a new
  // `sync` identity doesn't retrigger the reconnect logic while already online).
  useEffect(() => {
    onReconnectRef.current = onReconnect;
  }, [onReconnect]);

  useEffect(() => {
    const cameBackOnline = isOnline && !wasOnline.current;
    wasOnline.current = isOnline;

    // Only act on a genuine offline → online transition.
    if (!cameBackOnline || !classId) return;

    // Read pending count straight from storage so we never depend on
    // possibly-stale React state elsewhere.
    if (getPendingCountForClass(classId) === 0) return;

    const timer = setTimeout(() => {
      // Re-check at fire time in case a manual sync already cleared everything.
      if (getPendingCountForClass(classId) > 0) {
        onReconnectRef.current();
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [isOnline, classId]);

  return <>{children}</>;
}
