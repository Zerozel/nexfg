"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ArrowRight, Users, AlertTriangle, Check } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import {
  usePromotionMutations,
  type PromotionPreview,
  type PromotionOutcome,
} from "@/hooks/usePromotions";
import { supabase } from "@/lib/supabase/client";

interface Term {
  id: string;
  name: string;
  order: number;
  academic_year_id: string;
  academic_year_name: string;
}

interface OverrideState {
  outcome: PromotionOutcome;
  to_class_id: string | null;
}

// Store the term id alongside the preview, so confirm doesn't depend on a
// mutable state variable that could be reset between preview and confirm.
interface PreviewWithTerm {
  termId: string;
  data: PromotionPreview;
}

export default function PromotionsPage() {
  const { toast } = useToast();
  const { previewPromotions, confirmPromotions } = usePromotionMutations();

  const [terms, setTerms] = useState<Term[]>([]);
  const [selectedTermId, setSelectedTermId] = useState<string>("");
  const [preview, setPreview] = useState<PreviewWithTerm | null>(null);
  const [overrides, setOverrides] = useState<Record<string, OverrideState>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [result, setResult] = useState<{
    promoted: number;
    repeated: number;
    withdrawn: number;
    transferred: number;
    graduated: number;
    next_year_name: string;
    next_term_name: string;
  } | null>(null);

  // Load terms
  useEffect(() => {
    let cancelled = false;

    async function load() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      const schoolId = user?.app_metadata?.school_id;
      if (!schoolId) return;

      const { data } = await supabase
        .from("terms")
        .select(
          'id, name, "order", academic_year_id, academic_years:academic_year_id(name)'
        )
        .eq("school_id", schoolId)
        .is("is_deleted", false)
        .order("academic_year_id", { ascending: false })
        .order("order", { ascending: true });

      if (cancelled) return;

      const mapped: Term[] = (data || []).map((t: any) => ({
        id: t.id,
        name: t.name,
        order: t.order,
        academic_year_id: t.academic_year_id,
        academic_year_name: Array.isArray(t.academic_years)
          ? t.academic_years[0]?.name || ""
          : t.academic_years?.name || "",
      }));
      setTerms(mapped);

      // Pick the most recent academic year by name (not by UUID), then the
      // highest-order term within it.
      if (mapped.length > 0) {
        const yearNames = Array.from(
          new Set(mapped.map((t) => t.academic_year_name))
        ).sort((a, b) => b.localeCompare(a));
        const latestYearName = yearNames[0];

        const lastTerm = mapped
          .filter((t) => t.academic_year_name === latestYearName)
          .sort((a, b) => b.order - a.order)[0];

        if (lastTerm) {
          setSelectedTermId(lastTerm.id);
        }
      }
    }
    load();

    return () => {
      cancelled = true;
    };
  }, []);

  const handlePreview = async () => {
    if (!selectedTermId) {
      toast({
        title: "No term selected",
        description: "Please select a term before previewing.",
        variant: "destructive",
      });
      return;
    }
    setIsLoading(true);
    setPreview(null);
    setOverrides({});
    setResult(null);
    try {
      const data = await previewPromotions(selectedTermId);
      setPreview({ termId: selectedTermId, data });
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const classOptions = useMemo(() => {
    if (!preview) return [];
    return preview.data.all_classes || [];
  }, [preview]);

  const classNameById = useMemo(() => {
    const map = new Map<string, string>();
    for (const c of classOptions) map.set(c.id, c.name);
    return map;
  }, [classOptions]);

  const handleOverride = (
    studentId: string,
    field: keyof OverrideState,
    value: any
  ) => {
    setOverrides((prev) => ({
      ...prev,
      [studentId]: {
        outcome:
          field === "outcome"
            ? (value as PromotionOutcome)
            : prev[studentId]?.outcome ?? "promoted",
        to_class_id:
          field === "to_class_id"
            ? value
            : prev[studentId]?.to_class_id ?? null,
      },
    }));
  };

  const bulkOverrideGroup = (
    group: PromotionPreview["classes"][number],
    outcome: PromotionOutcome
  ) => {
    setOverrides((prev) => {
      const next = { ...prev };
      for (const s of group.students) {
        let targetId: string | null = null;
        if (outcome === "promoted") {
          targetId = s.recommended_to_class_id;
        } else if (outcome === "repeated") {
          targetId = group.from_class_id;
        }
        next[s.student_id] = { outcome, to_class_id: targetId };
      }
      return next;
    });
  };

  const bulkSetTarget = (
    group: PromotionPreview["classes"][number],
    targetClassId: string
  ) => {
    setOverrides((prev) => {
      const next = { ...prev };
      for (const s of group.students) {
        const current = next[s.student_id];
        const outcome = current?.outcome ?? s.recommended_outcome;
        if (outcome === "promoted" || outcome === "repeated") {
          next[s.student_id] = {
            outcome,
            to_class_id: targetClassId,
          };
        }
      }
      return next;
    });
  };

  const handleConfirm = async () => {
    if (!preview) {
      toast({
        title: "No preview loaded",
        description: "Please preview promotions before confirming.",
        variant: "destructive",
      });
      return;
    }

    // Read the term id from the stored preview, not from selectedTermId,
    // so a state change between preview and confirm can't break the call.
    const termId = preview.termId;
    if (!termId) {
      toast({
        title: "Missing term",
        description: "Cannot confirm without a source term. Preview again.",
        variant: "destructive",
      });
      return;
    }

    const rows = preview.data.classes.flatMap((group) =>
      group.students.map((s) => {
        const override = overrides[s.student_id];
        const outcome = override?.outcome ?? s.recommended_outcome;
        let toClassId = override?.to_class_id ?? s.recommended_to_class_id;

        if (outcome === "repeated" && !toClassId) {
          toClassId = group.from_class_id;
        }

        return {
          student_id: s.student_id,
          outcome,
          to_class_id: toClassId,
          average: s.average,
        };
      })
    );

    if (rows.length === 0) {
      toast({
        title: "No students to promote",
        description: "The preview contains no students.",
        variant: "destructive",
      });
      return;
    }

    setIsConfirming(true);
    try {
      const res = await confirmPromotions(termId, rows);
      setResult(res);
      setPreview(null);
      setOverrides({});
      toast({
        title: "Promotions confirmed",
        description: `${res.promoted} promoted, ${res.repeated} repeated, ${res.graduated} graduated`,
      });
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setIsConfirming(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Promotions</h1>
        <p className="text-muted-foreground">
          Move students from one academic year to the next. Review and
          override recommendations before confirming.
        </p>
      </div>

      {/* Source selector */}
      <Card>
        <CardHeader>
          <CardTitle>Source Term</CardTitle>
          <CardDescription>
            Select the term whose students are being promoted.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2 max-w-sm">
            <Label>Term</Label>
            <Select value={selectedTermId} onValueChange={setSelectedTermId}>
              <SelectTrigger>
                <SelectValue placeholder="Select term" />
              </SelectTrigger>
              <SelectContent>
                {terms.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.academic_year_name} — {t.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button
            onClick={handlePreview}
            disabled={!selectedTermId || isLoading}
          >
            {isLoading ? "Computing..." : "Preview Promotions"}
          </Button>
        </CardContent>
      </Card>

      {/* Result summary */}
      {result && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-600">
              <Check className="h-5 w-5" />
              Promotions Confirmed
            </CardTitle>
            <CardDescription>
              Enrollments created for {result.next_year_name} —{" "}
              {result.next_term_name}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div>
                <div className="text-2xl font-bold">{result.promoted}</div>
                <div className="text-xs text-gray-500">Promoted</div>
              </div>
              <div>
                <div className="text-2xl font-bold">{result.repeated}</div>
                <div className="text-xs text-gray-500">Repeated</div>
              </div>
              <div>
                <div className="text-2xl font-bold">{result.graduated}</div>
                <div className="text-xs text-gray-500">Graduated</div>
              </div>
              <div>
                <div className="text-2xl font-bold">{result.withdrawn}</div>
                <div className="text-xs text-gray-500">Withdrawn</div>
              </div>
              <div>
                <div className="text-2xl font-bold">{result.transferred}</div>
                <div className="text-xs text-gray-500">Transferred</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Preview */}
      {preview && (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ArrowRight className="h-5 w-5" />
                {preview.data.from_year?.name} {preview.data.from_term.name} →{" "}
                {preview.data.to_year?.name || "Next year"} First Term
              </CardTitle>
              <CardDescription>
                Promotion threshold:{" "}
                <strong>{preview.data.promotion_threshold}</strong>. Students
                at or above are recommended to promote; below are recommended
                to repeat. Use the bulk buttons to apply an outcome to a whole
                class at once, or override individual students below.
              </CardDescription>
            </CardHeader>
          </Card>

          {preview.data.classes.map((group) => (
            <Card key={group.from_class_id}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  {group.from_class_name}
                  {group.target_class_group_name && (
                    <span className="text-sm font-normal text-gray-500">
                      → {group.target_class_group_name}
                    </span>
                  )}
                </CardTitle>
                <CardDescription>
                  {group.students.length} student
                  {group.students.length !== 1 ? "s" : ""}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Bulk actions */}
                <div className="flex flex-wrap gap-2 pb-3 border-b">
                  <Button
                    size="sm"
                    variant="default"
                    onClick={() => bulkOverrideGroup(group, "promoted")}
                  >
                    Promote All
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => bulkOverrideGroup(group, "repeated")}
                  >
                    Repeat All
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => bulkOverrideGroup(group, "graduated")}
                  >
                    Graduate All
                  </Button>
                  {classOptions.length > 0 && (
                    <Select onValueChange={(v) => bulkSetTarget(group, v)}>
                      <SelectTrigger className="w-[200px]">
                        <SelectValue placeholder="Set target for all..." />
                      </SelectTrigger>
                      <SelectContent>
                        {classOptions.map((c) => (
                          <SelectItem key={c.id} value={c.id}>
                            {c.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>

                {/* Per-student rows */}
                <div className="space-y-3">
                  {group.students.map((s) => {
                    const override = overrides[s.student_id];
                    const currentOutcome =
                      override?.outcome ?? s.recommended_outcome;
                    const currentTarget =
                      override?.to_class_id ?? s.recommended_to_class_id;
                    const showTarget =
                      currentOutcome === "promoted" ||
                      currentOutcome === "repeated";

                    return (
                      <div
                        key={s.student_id}
                        className="grid grid-cols-1 md:grid-cols-4 gap-3 items-center border-b pb-3"
                      >
                        <div>
                          <div className="font-medium">{s.full_name}</div>
                          <div className="text-xs text-gray-500">
                            {s.admission_number || "—"} · Avg{" "}
                            {s.average.toFixed(1)}
                          </div>
                        </div>
                        <div>
                          <Select
                            value={currentOutcome}
                            onValueChange={(v) =>
                              handleOverride(s.student_id, "outcome", v)
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="promoted">
                                Promote
                              </SelectItem>
                              <SelectItem value="repeated">Repeat</SelectItem>
                              <SelectItem value="graduated">
                                Graduate
                              </SelectItem>
                              <SelectItem value="withdrawn">
                                Withdraw
                              </SelectItem>
                              <SelectItem value="transferred">
                                Transfer
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          {showTarget && (
                            <Select
                              value={currentTarget || ""}
                              onValueChange={(v) =>
                                handleOverride(s.student_id, "to_class_id", v)
                              }
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Target class" />
                              </SelectTrigger>
                              <SelectContent>
                                {classOptions.map((c) => (
                                  <SelectItem key={c.id} value={c.id}>
                                    {c.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                        </div>
                        <div className="text-xs text-gray-500">
                          {currentOutcome === "promoted" &&
                            `→ ${
                              classNameById.get(currentTarget || "") || "—"
                            }`}
                          {currentOutcome === "repeated" &&
                            `Repeat ${
                              classNameById.get(currentTarget || "") ||
                              group.from_class_name
                            }`}
                          {currentOutcome === "graduated" &&
                            "Final class — graduate"}
                          {currentOutcome === "withdrawn" && "Withdrawn"}
                          {currentOutcome === "transferred" && "Transferred"}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          ))}

          <Card>
            <CardContent className="flex items-center justify-between py-6">
              <div className="flex items-center gap-2 text-amber-600 text-sm">
                <AlertTriangle className="h-4 w-4" />
                This will create a new academic year and enroll students in
                their new classes.
              </div>
              <Button
                onClick={() => setShowConfirmDialog(true)}
                disabled={isConfirming}
              >
                Confirm Promotions
              </Button>
            </CardContent>
          </Card>
        </>
      )}

      {/* Confirm dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm promotions?</DialogTitle>
            <DialogDescription>
              This will:
              <ul className="list-disc ml-5 mt-2 space-y-1">
                <li>
                  Create the next academic year if it doesn&apos;t exist
                </li>
                <li>
                  Record each student&apos;s outcome (promoted / repeated /
                  graduated / etc.)
                </li>
                <li>
                  Enroll promoted and repeated students in their target
                  classes
                </li>
                <li>
                  Keep the old year&apos;s Third Term active — the new
                  year&apos;s First Term is NOT marked current until you
                  switch manually on the Sessions page
                </li>
              </ul>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowConfirmDialog(false)}
              disabled={isConfirming}
            >
              Cancel
            </Button>
            <Button
              onClick={async () => {
                setShowConfirmDialog(false);
                await handleConfirm();
              }}
              disabled={isConfirming}
            >
              {isConfirming ? "Confirming..." : "Yes, Confirm Promotions"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
