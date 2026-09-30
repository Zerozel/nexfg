"use client";

import { useState, useEffect, useCallback } from "react";
import { Loader2, Trash2, Plus } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface Broadcast {
  id: string;
  title: string;
  body: string;
  severity: "info" | "warning" | "critical";
  target_roles: string[];
  dismissible: boolean;
  is_active: boolean;
  starts_at: string;
  ends_at: string | null;
  created_at: string;
}

const SEVERITY_COLORS = {
  info: "bg-blue-100 text-blue-700",
  warning: "bg-amber-100 text-amber-700",
  critical: "bg-red-100 text-red-700",
};

const ALL_ROLES = ["admin", "principal", "teacher"] as const;

export default function SuperAdminBroadcastsPage() {
  const { toast } = useToast();
  const [items, setItems] = useState<Broadcast[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [form, setForm] = useState({
    title: "",
    body: "",
    severity: "info" as "info" | "warning" | "critical",
    target_roles: ["admin", "principal", "teacher"] as string[],
    dismissible: true,
    ends_at: "",
  });

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/broadcasts");
      if (!res.ok) throw new Error("Failed to load");
      const result = await res.json();
      setItems(result.data.broadcasts || []);
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    load();
  }, [load]);

  const toggleRole = (role: string) => {
    setForm((f) => ({
      ...f,
      target_roles: f.target_roles.includes(role)
        ? f.target_roles.filter((r) => r !== role)
        : [...f.target_roles, role],
    }));
  };

  const handleCreate = async () => {
    if (!form.title.trim() || !form.body.trim()) return;
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/broadcasts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          ends_at: form.ends_at || null,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to create");
      }
      toast({ title: "Broadcast created" });
      setShowForm(false);
      setForm({
        title: "",
        body: "",
        severity: "info",
        target_roles: ["admin", "principal", "teacher"],
        dismissible: true,
        ends_at: "",
      });
      load();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleActive = async (b: Broadcast) => {
    try {
      await fetch("/api/broadcasts", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: b.id, is_active: !b.is_active }),
      });
      load();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this broadcast?")) return;
    try {
      await fetch(`/api/broadcasts?id=${id}`, { method: "DELETE" });
      toast({ title: "Deleted" });
      load();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Broadcasts</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Send a banner message to users on the platform.
          </p>
        </div>
        <button
          onClick={() => setShowForm((s) => !s)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-green-700 text-white text-sm font-medium hover:bg-green-800"
        >
          <Plus className="h-4 w-4" />
          New Broadcast
        </button>
      </div>

      {showForm && (
        <div className="border rounded-lg p-5 bg-white space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Title</label>
            <input
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              placeholder="Scheduled maintenance this weekend"
              className="w-full border rounded-md px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-green-500/30"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Body</label>
            <textarea
              value={form.body}
              onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))}
              placeholder="Details of the message…"
              rows={3}
              className="w-full border rounded-md px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-green-500/30 resize-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Severity</label>
              <select
                value={form.severity}
                onChange={(e) =>
                  setForm((f) => ({ ...f, severity: e.target.value as any }))
                }
                className="w-full border rounded-md px-3 py-2 text-sm outline-none"
              >
                <option value="info">Info</option>
                <option value="warning">Warning</option>
                <option value="critical">Critical</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">
                End date (optional)
              </label>
              <input
                type="datetime-local"
                value={form.ends_at}
                onChange={(e) =>
                  setForm((f) => ({ ...f, ends_at: e.target.value }))
                }
                className="w-full border rounded-md px-3 py-2 text-sm outline-none"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Target roles</label>
            <div className="flex flex-wrap gap-2">
              {ALL_ROLES.map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => toggleRole(r)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md border transition-colors ${
                    form.target_roles.includes(r)
                      ? "bg-green-700 text-white border-green-700"
                      : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.dismissible}
              onChange={(e) =>
                setForm((f) => ({ ...f, dismissible: e.target.checked }))
              }
            />
            Dismissible by users
          </label>

          <div className="flex justify-end gap-2 pt-2 border-t">
            <button
              onClick={() => setShowForm(false)}
              className="px-4 py-2 text-sm rounded-md border hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleCreate}
              disabled={
                isSubmitting ||
                !form.title.trim() ||
                !form.body.trim() ||
                form.target_roles.length === 0
              }
              className="px-4 py-2 text-sm rounded-md bg-green-700 text-white hover:bg-green-800 disabled:opacity-50 inline-flex items-center gap-2"
            >
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              Publish
            </button>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-16 text-sm text-gray-500 border rounded-lg">
          No broadcasts yet.
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((b) => (
            <div key={b.id} className="border rounded-lg p-4 bg-white">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium">{b.title}</span>
                    <span
                      className={`px-2 py-0.5 text-[10px] font-medium rounded-full uppercase ${
                        SEVERITY_COLORS[b.severity]
                      }`}
                    >
                      {b.severity}
                    </span>
                    <span
                      className={`px-2 py-0.5 text-[10px] font-medium rounded-full uppercase ${
                        b.is_active
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {b.is_active ? "Active" : "Inactive"}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 mt-2 whitespace-pre-wrap">
                    {b.body}
                  </p>
                  <div className="text-xs text-gray-500 mt-2">
                    Targets: {b.target_roles.join(", ")}
                    {b.ends_at &&
                      ` · Ends ${new Date(b.ends_at).toLocaleDateString()}`}
                  </div>
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  <button
                    onClick={() => toggleActive(b)}
                    className="px-3 py-1.5 text-xs rounded-md border hover:bg-gray-50"
                  >
                    {b.is_active ? "Deactivate" : "Activate"}
                  </button>
                  <button
                    onClick={() => handleDelete(b.id)}
                    className="p-1.5 rounded-md text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
