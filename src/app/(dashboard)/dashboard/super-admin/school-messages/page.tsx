"use client";

import { useState, useEffect, useCallback } from "react";
import { Loader2, MessageCircle } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface SchoolMessageRow {
  id: string;
  teacher_name: string;
  school_name: string;
  last_message_at: string;
  unread_count: number;
  status: string;
}

/**
 * NOTE: The current /api/school-messages route only returns conversations
 * scoped to the caller's school. For super_admin to see across schools, we
 * rely on the RLS policy allowing super_admin to read all — but the route
 * still filters by school_id. This page is a placeholder that will show
 * nothing until the route is extended. Tracked as a follow-up.
 */
export default function SuperAdminSchoolMessagesPage() {
  const { toast } = useToast();
  const [items, setItems] = useState<SchoolMessageRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/school-messages");
      if (!res.ok) throw new Error("Failed to load");
      const result = await res.json();
      // Handle both shapes: conversations[] for admin, or single conversation for teacher
      if (result.data.conversations) {
        setItems(result.data.conversations);
      } else {
        setItems([]);
      }
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">School Messages</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Teacher → Admin conversations across the platform.
        </p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-16 text-sm text-gray-500 border rounded-lg">
          <MessageCircle className="h-8 w-8 mx-auto mb-2 text-gray-300" />
          <p>No messages to display.</p>
          <p className="text-xs mt-1">
            Cross-school view requires an API extension. Currently empty by design.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {items.map((c) => (
            <div key={c.id} className="border rounded-lg p-4 bg-white">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-sm">
                    {c.teacher_name} → {c.school_name || "Unknown school"}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {new Date(c.last_message_at).toLocaleDateString()}
                  </div>
                </div>
                {c.unread_count > 0 && (
                  <span className="h-5 min-w-[20px] px-1.5 rounded-full bg-green-600 text-white text-xs font-bold flex items-center justify-center">
                    {c.unread_count}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
