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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Calendar, ArrowRight, Check } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabase/client";

interface Term {
  id: string;
  name: string;
  order: number;
  is_current: boolean;
  academic_year_id: string;
  academic_year_name: string;
}

export default function SessionsPage() {
  const { toast } = useToast();
  const [terms, setTerms] = useState<Term[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdvancing, setIsAdvancing] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const loadTerms = useCallback(async () => {
    setIsLoading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      const schoolId = user?.app_metadata?.school_id;
      if (!schoolId) return;

      const { data, error } = await supabase
        .from("terms")
        .select("id, name, \"order\", is_current, academic_year_id, academic_years:academic_year_id(name)")
        .eq("school_id", schoolId)
        .is("is_deleted", false)
        .order("academic_year_id", { ascending: false })
        .order("order", { ascending: true });

      if (error) throw error;

      const mapped: Term[] = (data || []).map((t: any) => ({
        id: t.id,
        name: t.name,
        order: t.order,
        is_current: t.is_current,
        academic_year_id: t.academic_year_id,
        academic_year_name: Array.isArray(t.academic_years)
          ? t.academic_years[0]?.name || ""
          : t.academic_years?.name || "",
      }));

      setTerms(mapped);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTerms();
  }, [loadTerms]);

  const currentTerm = terms.find((t) => t.is_current);
  const nextTerm = currentTerm
    ? terms.find(
        (t) =>
          t.academic_year_id === currentTerm.academic_year_id &&
          t.order > currentTerm.order
      )
    : null;

  const handleAdvance = async () => {
    if (!currentTerm) return;
    setIsAdvancing(true);
    try {
      const response = await fetch(
        `/api/admin/terms/${currentTerm.id}/advance`,
        { method: "POST" }
      );
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "Failed to advance term");
      }
      toast({
        title: "Term advanced",
        description: `${result.data.from_term.name} → ${result.data.to_term.name} (${result.data.students_carried_forward} students carried forward)`,
      });
      setShowConfirm(false);
      await loadTerms();
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setIsAdvancing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
        <p className="text-gray-600">Loading sessions...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Sessions</h1>
        <p className="text-muted-foreground">
          Manage academic year terms and advance to the next term.
        </p>
      </div>

      {/* Current + Next */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-500">
              Current Term
            </CardTitle>
          </CardHeader>
          <CardContent>
            {currentTerm ? (
              <>
                <div className="text-2xl font-bold">{currentTerm.name}</div>
                <p className="text-sm text-gray-500 mt-1">
                  {currentTerm.academic_year_name}
                </p>
              </>
            ) : (
              <p className="text-gray-500">No current term set.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-500">
              Next Term
            </CardTitle>
          </CardHeader>
          <CardContent>
            {nextTerm ? (
              <>
                <div className="text-2xl font-bold">{nextTerm.name}</div>
                <p className="text-sm text-gray-500 mt-1">
                  {nextTerm.academic_year_name}
                </p>
              </>
            ) : (
              <p className="text-gray-500">
                No next term. Create the next academic year when ready.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Advance action */}
      {currentTerm && nextTerm && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ArrowRight className="h-5 w-5" />
              Advance to {nextTerm.name}
            </CardTitle>
            <CardDescription>
              Moves the current term to {nextTerm.name} and carries forward
              all students in their existing classes. Historical records are
              preserved.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => setShowConfirm(true)}>
              <ArrowRight className="mr-2 h-4 w-4" />
              Advance to {nextTerm.name}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* All terms */}
      <Card>
        <CardHeader>
          <CardTitle>All Terms</CardTitle>
          <CardDescription>
            Terms are organized by academic year.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(
              terms.reduce((acc: Record<string, Term[]>, t) => {
                if (!acc[t.academic_year_name]) acc[t.academic_year_name] = [];
                acc[t.academic_year_name].push(t);
                return acc;
              }, {})
            ).map(([year, yearTerms]) => (
              <div key={year}>
                <div className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  {year}
                </div>
                <div className="space-y-1 pl-6">
                  {yearTerms.map((t) => (
                    <div
                      key={t.id}
                      className="flex items-center gap-2 text-sm"
                    >
                      {t.is_current ? (
                        <Check className="h-4 w-4 text-green-600" />
                      ) : (
                        <span className="h-4 w-4" />
                      )}
                      <span
                        className={t.is_current ? "font-semibold" : ""}
                      >
                        {t.name}
                        {t.is_current && (
                          <span className="ml-2 text-xs text-green-600">
                            (Current)
                          </span>
                        )}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Confirm dialog */}
      <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Advance to {nextTerm?.name}?
            </DialogTitle>
            <DialogDescription>
              This will:
              <ul className="list-disc ml-5 mt-2 space-y-1">
                <li>
                  Set {currentTerm?.name} as inactive
                </li>
                <li>
                  Set {nextTerm?.name} as the current term
                </li>
                <li>
                  Carry forward all students in their existing classes into{" "}
                  {nextTerm?.name}
                </li>
                <li>Preserve all historical records</li>
              </ul>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowConfirm(false)}
              disabled={isAdvancing}
            >
              Cancel
            </Button>
            <Button onClick={handleAdvance} disabled={isAdvancing}>
              {isAdvancing ? "Advancing..." : "Advance Term"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
