"use client";

import { useState, useEffect, useCallback } from "react";
import { Loader2, Bug, Lightbulb, MessageCircle } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface FeedbackItem {
  id: string;
  school_id: string | null;
  school_name: string | null;
  submitted_by: string;
  submitter_name: string;
  submitter_role: string;
  category: "bug" | "feature" | "general";
  subject: string;
  body: string;
  status: "new" | "reviewing" | "resolved" | "dismissed";
  admin_notes: string | null;
  created_at: string;
}

const CATEGORY_ICONS = {
  bug: Bug,
  feature: Lightbulb,
  general: MessageCircle,
};

const STATUS_COLORS: Record<string, string> = {
  new: "bg-blue-100 text-blue-700",
  reviewing: "bg-amber-100 text-amber-700",
  resolved: "bg-green-100 text-green-700",
  dismissed: "bg-gray-100 text-gray-600",
};

export default function SuperAdminFeedbackPage() {
  const { toast } = useToast();
  const [items, setItems] = useState<FeedbackItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<string>("");
  const [activeId, setActiveId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const url = filter ? `/api/feedback?status=${filter}` : "/api/feedback";
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to load feedback");
      const result = await res.json();
      setItems(result.data.feedback || []);
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, [filter, toast]);

  useEffect(() => {
    load();
  }, [load]);

  const updateStatus = async (id: string, status: string) => {
    try {
      const res = await fetch("/api/feedback", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      if (!res.ok) throw new Error("Failed to update");
      toast({ title: "Updated" });
      load();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Feedback</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Messages from school admins and teachers about the platform.
        </p>
      </div>

      {/* Filter */}
      <div className="flex flex-wrap gap-2">
        {["", "new", "reviewing", "resolved", "dismissed"].map((s) => (
          <button
            key={s || "all"}
            onClick={() => setFilter(s)}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              filter === s
                ? "bg-green-700 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {s === "" ? "All" : s}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-16 text-sm text-gray-500 border rounded-lg">
          No feedback yet.
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => {
            const Icon = CATEGORY_ICONS[item.category];
            const isActive = activeId === item.id;
            return (
              <div
                key={item.id}
                className="border rounded-lg overflow-hidden bg-white"
              >
                <button
                  onClick={() => setActiveId(isActive ? null : item.id)}
                  className="w-full text-left p-4 hover:bg-gray-50"
                >
                  <div className="flex items-start gap-3">
                    <div className="h-9 w-9 rounded-md bg-gray-100 flex items-center justify-center flex-shrink-0">
                      <Icon className="h-4 w-4 text-gray-700" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-sm">
                          {item.subject}
                        </span>
                        <span
                          className={`px-2 py-0.5 text-[10px] font-medium rounded-full uppercase tracking-wide ${
                            STATUS_COLORS[item.status]
                          }`}
                        >
                          {item.status}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {item.submitter_name} · {item.submitter_role}
                        {item.school_name && ` · ${item.school_name}`} ·{" "}
                        {new Date(item.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </button>

                {isActive && (
                  <div className="border-t p-4 bg-gray-50">
                    <p className="text-sm whitespace-pre-wrap mb-4">{item.body}</p>
                    <div className="flex flex-wrap gap-2">
                      {["reviewing", "resolved", "dismissed"].map((s) => (
                        <button
                          key={s}
                          onClick={() => updateStatus(item.id, s)}
                          disabled={item.status === s}
                          className="px-3 py-1.5 text-xs font-medium rounded-md bg-white border hover:bg-gray-50 disabled:opacity-40"
                        >
                          Mark as {s}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
