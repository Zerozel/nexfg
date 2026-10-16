"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, Plus, Copy, Trash2, Ticket } from "lucide-react";

interface PromoCode {
  id: string;
  code: string;
  description: string | null;
  target_tier: string;
  duration_days: number;
  max_uses: number;
  uses_count: number;
  expires_at: string | null;
  revoked_at: string | null;
  created_at: string;
}

const DURATION_OPTIONS = [
  { value: "days-7", label: "7 days" },
  { value: "days-14", label: "14 days" },
  { value: "days-30", label: "30 days (1 month)" },
  { value: "term-1", label: "1 term" },
  { value: "term-2", label: "2 terms" },
  { value: "session-1", label: "1 academic session" },
];

export default function PromoCodesPage() {
  const { toast } = useToast();
  const [codes, setCodes] = useState<PromoCode[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);

  // Form state
  const [targetTier, setTargetTier] = useState("growth");
  const [duration, setDuration] = useState("term-1");
  const [maxUses, setMaxUses] = useState("1");
  const [description, setDescription] = useState("");

  const fetchCodes = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/super-admin/promo-codes");
      if (!res.ok) throw new Error("Failed to load codes");
      const result = await res.json();
      setCodes(result.data.codes || []);
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchCodes();
  }, [fetchCodes]);

  const handleCreate = async () => {
    setIsCreating(true);
    try {
      const res = await fetch("/api/super-admin/promo-codes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          target_tier: targetTier,
          duration_option: duration,
          max_uses: Number(maxUses),
          description: description.trim() || null,
        }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || "Create failed");

      toast({
        title: "Code created",
        description: body.data.code.code,
      });

      // Copy to clipboard automatically — most common action after create
      try {
        await navigator.clipboard.writeText(body.data.code.code);
      } catch {
        /* clipboard denied — no big deal */
      }

      setDescription("");
      fetchCodes();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setIsCreating(false);
    }
  };

  const handleCopy = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      toast({ title: "Copied", description: code });
    } catch {
      toast({ title: "Copy failed", variant: "destructive" });
    }
  };

  const handleRevoke = async (id: string) => {
    if (!confirm("Revoke this code? Schools that already redeemed it keep access.")) return;
    try {
      const res = await fetch(`/api/super-admin/promo-codes/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Revoke failed");
      toast({ title: "Revoked" });
      fetchCodes();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Promo Codes</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Generate single-use codes that grant schools a free subscription for a set duration.
        </p>
      </div>

      {/* Create form */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Create a code</CardTitle>
          <CardDescription>
            The code is copied to your clipboard right after creation.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Target tier</Label>
              <Select value={targetTier} onValueChange={setTargetTier}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="starter">Starter</SelectItem>
                  <SelectItem value="growth">Growth</SelectItem>
                  <SelectItem value="premium">Premium</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Duration</Label>
              <Select value={duration} onValueChange={setDuration}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DURATION_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Max uses</Label>
              <Input
                type="number"
                min={1}
                value={maxUses}
                onChange={(e) => setMaxUses(e.target.value)}
                placeholder="1"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Description (optional)</Label>
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Lagos launch promo — March 2026"
            />
          </div>

          <Button onClick={handleCreate} disabled={isCreating}>
            {isCreating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating…
              </>
            ) : (
              <>
                <Plus className="mr-2 h-4 w-4" />
                Create code
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Ticket className="h-4 w-4" />
            All codes
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
            </div>
          ) : codes.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-6">
              No codes yet. Create one above.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Tier</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Uses</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {codes.map((c) => {
                    const isRevoked = !!c.revoked_at;
                    const isExhausted = c.uses_count >= c.max_uses;
                    const isExpired =
                      c.expires_at && new Date(c.expires_at) < new Date();
                    const status = isRevoked
                      ? "revoked"
                      : isExpired
                        ? "expired"
                        : isExhausted
                          ? "exhausted"
                          : "active";

                    return (
                      <TableRow key={c.id}>
                        <TableCell className="font-mono text-xs">
                          <div className="flex items-center gap-2">
                            <span>{c.code}</span>
                            <button
                              onClick={() => handleCopy(c.code)}
                              className="text-gray-400 hover:text-gray-900"
                              title="Copy"
                            >
                              <Copy className="h-3.5 w-3.5" />
                            </button>
                          </div>
                          {c.description && (
                            <div className="text-[10px] text-gray-400 mt-0.5 font-sans">
                              {c.description}
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="capitalize text-sm">
                          {c.target_tier}
                        </TableCell>
                        <TableCell className="text-sm">
                          {c.duration_days} days
                        </TableCell>
                        <TableCell className="text-sm">
                          {c.uses_count} / {c.max_uses}
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={
                              status === "active"
                                ? "bg-green-100 text-green-700"
                                : status === "exhausted"
                                  ? "bg-amber-100 text-amber-700"
                                  : "bg-gray-100 text-gray-500"
                            }
                          >
                            {status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          {!isRevoked && (
                            <button
                              onClick={() => handleRevoke(c.id)}
                              className="text-gray-400 hover:text-red-600"
                              title="Revoke"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
