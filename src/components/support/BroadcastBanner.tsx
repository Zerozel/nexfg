"use client";

import { useState, useEffect } from "react";
import { X, Info, AlertTriangle, AlertCircle } from "lucide-react";
import { useBroadcasts, type Broadcast } from "@/hooks/useBroadcasts";

const SEVERITY_STYLES: Record<
  Broadcast["severity"],
  { bg: string; border: string; text: string; Icon: typeof Info }
> = {
  info: {
    bg: "#eff6ff",
    border: "#3b82f6",
    text: "#1e40af",
    Icon: Info,
  },
  warning: {
    bg: "#fffbeb",
    border: "#f59e0b",
    text: "#92400e",
    Icon: AlertTriangle,
  },
  critical: {
    bg: "#fef2f2",
    border: "#dc2626",
    text: "#991b1b",
    Icon: AlertCircle,
  },
};

const DISMISSED_KEY = "nexa-dismissed-broadcasts";

function loadDismissed(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(DISMISSED_KEY);
    if (!raw) return new Set();
    return new Set(JSON.parse(raw) as string[]);
  } catch {
    return new Set();
  }
}

function saveDismissed(ids: Set<string>) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(DISMISSED_KEY, JSON.stringify(Array.from(ids)));
  } catch {
    // Silently ignore quota errors
  }
}

export function BroadcastBanner() {
  const { broadcasts, isLoading } = useBroadcasts();
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  useEffect(() => {
    setDismissed(loadDismissed());
  }, []);

  const handleDismiss = (id: string) => {
    const next = new Set(dismissed);
    next.add(id);
    setDismissed(next);
    saveDismissed(next);
  };

  if (isLoading) return null;

  const visible = broadcasts.filter(
    (b) => b.dismissible === false || !dismissed.has(b.id)
  );

  if (visible.length === 0) return null;

  return (
    <>
      {visible.map((b) => {
        const style = SEVERITY_STYLES[b.severity];
        const Icon = style.Icon;
        return (
          <div
            key={b.id}
            role="alert"
            style={{
              background: style.bg,
              borderBottom: `1px solid ${style.border}`,
              color: style.text,
              padding: "10px 16px",
              display: "flex",
              alignItems: "flex-start",
              gap: 12,
              fontSize: 13,
              lineHeight: 1.5,
            }}
          >
            <Icon size={16} strokeWidth={2.25} style={{ flexShrink: 0, marginTop: 2 }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 600, marginBottom: 2 }}>{b.title}</div>
              <div style={{ opacity: 0.9 }}>{b.body}</div>
            </div>
            {b.dismissible && (
              <button
                onClick={() => handleDismiss(b.id)}
                aria-label="Dismiss"
                style={{
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  color: style.text,
                  opacity: 0.6,
                  padding: 2,
                  flexShrink: 0,
                }}
              >
                <X size={16} />
              </button>
            )}
          </div>
        );
      })}
    </>
  );
}
