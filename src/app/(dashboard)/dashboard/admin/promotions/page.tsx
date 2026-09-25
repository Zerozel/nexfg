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
import { ArrowRight, Users, AlertTriangle, Check } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import {
  usePromotionMutations,
  type PromotionPreview,
  type PromotionOutcome,
} from "@/hooks/usePromotions";
import { useAcademicYears } from "@/hooks/useAcademicYears";
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

export default function PromotionsPage() {
  const { toast } = useToast();
  const { previewPromotions, confirmPromotions } = usePromotionMutations();

  const [terms, setTerms] = useState<Term[]>([]);
  const [selectedTermId, setSelectedTermId] = useState<string>("");
  const [preview, setPreview] = useState<PromotionPreview | null>(null);
  const [overrides, setOverrides] = useState<Record<string, OverrideState>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
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

      // Default select to the last term of the most recent year
      if (mapped.length > 0) {
        const latestYear = mapped[0].academic_year_id;
        const lastTerm = mapped
          .filter((t) => t.academic_year_id === latestYear)
          .sort((a, b) => b.order - a.order)[0];
        setSelectedTermId(lastTerm.id);
      }
    }
    load();
  }, []);

  const handlePreview = async () => {
    if (!selectedTermId) return;
    setIsLoading(true);
    setPreview(null);
    setOverrides({});
    setResult(null);
    try {
      const data = await previewPromotions(selectedTermId);
      setPreview(data);
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

  // All possible target classes from the preview for override dropdowns
  const targetClassOptions = useMemo(() => {
    if (!preview) return [];
    const set = new Map<string, string>();
    for (const group of preview.classes) {
      for (const s of group.students) {
        if (s.recommended_to_class_id && s.recommended_to_class_name) {
          set.set(s.recommended_to_class_id, s.recommended_to_class_name);
        }
      }
    }
    return Array.from(set.entries()).map(([id, name]) => ({ id, name }));
  }, [preview]);

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

  const handleConfirm = async () => {
    if (!preview) return;
    setIsConfirming(true);
    try {
      const rows = preview.classes.flatMap((group) =>
        group.students.map((s) => {
          const override = overrides[s.student_id];
          const outcome = override?.outcome ?? s.recommended_outcome;
          const toClassId =
            override?.to_class_id ?? s.recommended_to_class_id;
          return {
            student_id: s.student_id,
            outcome,
            to_class_id: toClassId,
            average: s.average,
          };
        })
      );

      const res = await confirmPromotions(selectedTermId, rows);
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
          <Button onClick={handlePreview} disabled={!selectedTermId || isLoading}>
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
                {preview.from_year?.name} {preview.from_term.name} →{" "}
                {preview.to_year?.name || "Next year"} First Term
              </CardTitle>
              <CardDescription>
                Promotion threshold:{" "}
                <strong>{preview.promotion_threshold}</strong>. Students at or
                above are recommended to promote; below are recommended to
                repeat. Override any recommendation below.
              </CardDescription>
            </CardHeader>
          </Card>

          {preview.classes.map((group) => (
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
              <CardContent>
                <div className="space-y-3">
                  {group.students.map((s) => {
                    const override = overrides[s.student_id];
                    const currentOutcome =
                      override?.outcome ?? s.recommended_outcome;
                    const currentTarget =
                      override?.to_class_id ?? s.recommended_to_class_id;
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
                              <SelectItem value="promoted">Promote</SelectItem>
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
                          {(currentOutcome === "promoted" ||
                            currentOutcome === "repeated") && (
                            <Select
                              value={currentTarget || ""}
                              onValueChange={(v) =>
                                handleOverride(
                                  s.student_id,
                                  "to_class_id",
                                  v
                                )
                              }
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Target class" />
                              </SelectTrigger>
                              <SelectContent>
                                {targetClassOptions.map((t) => (
                                  <SelectItem key={t.id} value={t.id}>
                                    {t.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                        </div>
                        <div className="text-xs text-gray-500">
                          {currentOutcome === "promoted" &&
                            `→ ${s.recommended_to_class_name || "—"}`}
                          {currentOutcome === "repeated" &&
                            `Repeat ${group.from_class_name}`}
                          {currentOutcome === "graduated" &&
                            "Final class — graduate"}
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
              <Button onClick={handleConfirm} disabled={isConfirming}>
                {isConfirming ? "Confirming..." : "Confirm Promotions"}
              </Button>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
