"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, FileDown, ArrowRight, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { useAdminClasses } from "@/hooks/useClasses";
import { useSubjects } from "@/hooks/useSubjects";
import { useCurrentTerm } from "@/hooks/useCurrentTerm";
import { useEnrolledStudents, createBatch } from "@/hooks/useScoreSheets";

export function BatchCreator() {
  const router = useRouter();
  const { toast } = useToast();

  const { data: classesData, isLoading: loadingClasses } = useAdminClasses({
    pageSize: 100,
  });
  const { data: subjectsData, isLoading: loadingSubjects } = useSubjects({
    pageSize: 100,
  });
  const { terms, currentTerm, loading: loadingTerms } = useCurrentTerm();

  const [classId, setClassId] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [termId, setTermId] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [createdBatchId, setCreatedBatchId] = useState<string | null>(null);

  // Default term to the current one when it loads (only set once — do not
  // clobber a user's manual selection).
  const [termInitialized, setTermInitialized] = useState(false);
  if (!termInitialized && currentTerm && !termId) {
    setTermId(currentTerm.id);
    setTermInitialized(true);
  }

  const classes = classesData?.data || [];
  const subjects = subjectsData?.data || [];

  const {
    data: enrollmentData,
    isLoading: loadingStudents,
    error: enrollmentError,
  } = useEnrolledStudents(
    classId || null,
    termId || null,
    subjectId || null
  );

  const handleCreate = async () => {
    if (!classId || !subjectId || !termId) return;
    setIsCreating(true);
    try {
      // Section 7: createBatch now returns the unwrapped { batch_id }
      const result = await createBatch({
        class_id: classId,
        subject_id: subjectId,
        term_id: termId,
      });
      setCreatedBatchId(result.batch_id);
      toast({
        title: "Batch created",
        description: "Print the sheet or proceed to upload the filled sheet.",
      });
    } catch (err: any) {
      // Duplicate batch: offer to jump to the existing one
      if (err?.code === "DUPLICATE_BATCH" && err?.existingBatchId) {
        toast({
          title: "Score sheet already exists",
          description: "Redirecting to the existing batch…",
        });
        router.push(`/dashboard/admin/score-sheets/${err.existingBatchId}`);
        return;
      }
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handlePrint = () => {
    if (!createdBatchId) return;
    window.open(
      `/api/admin/score-sheets/batches/${createdBatchId}/pdf`,
      "_blank"
    );
  };

  const handleProceed = () => {
    if (!createdBatchId) return;
    router.push(`/dashboard/admin/score-sheets/${createdBatchId}`);
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <Card>
        <CardHeader>
          <CardTitle>New Score Sheet</CardTitle>
          <CardDescription>
            Pick the class, subject, and term. A printable sheet will be
            generated with all enrolled students plus 3 blank rows for
            latecomers.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Class</Label>
            <Select
              value={classId}
              onValueChange={setClassId}
              disabled={loadingClasses}
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={loadingClasses ? "Loading…" : "Select a class"}
                />
              </SelectTrigger>
              <SelectContent>
                {classes.map((c: any) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Subject</Label>
            <Select
              value={subjectId}
              onValueChange={setSubjectId}
              disabled={loadingSubjects}
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={loadingSubjects ? "Loading…" : "Select a subject"}
                />
              </SelectTrigger>
              <SelectContent>
                {subjects.map((s: any) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Term</Label>
            <Select
              value={termId}
              onValueChange={setTermId}
              disabled={loadingTerms}
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={loadingTerms ? "Loading…" : "Select a term"}
                />
              </SelectTrigger>
              <SelectContent>
                {terms.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.name}
                    {t.is_current && " (current)"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {!loadingTerms && terms.length === 0 && (
              <p className="text-xs text-amber-600 mt-1">
                No terms found for your school. Set up terms in School Settings
                first.
              </p>
            )}
          </div>

          {classId && subjectId && termId && (
            <div className="mt-4 p-4 rounded-lg bg-gray-50 border">
              {loadingStudents ? (
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading roster…
                </div>
              ) : enrollmentError ? (
                <div className="flex items-start gap-2 text-sm text-amber-700">
                  <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                  <span>{enrollmentError}</span>
                </div>
              ) : (
                <>
                  <div className="text-sm font-medium mb-2">
                    {enrollmentData?.students.length || 0} enrolled student
                    {(enrollmentData?.students.length || 0) !== 1 ? "s" : ""}
                  </div>
                  {enrollmentData?.teacher_name && (
                    <div className="text-xs text-gray-500 mb-3">
                      Teacher: {enrollmentData.teacher_name}
                    </div>
                  )}
                  <div className="text-xs text-gray-500">
                    Sheet will have{" "}
                    {enrollmentData?.students.length || 0} rows + 3 blank rows
                    for latecomers.
                  </div>
                </>
              )}
            </div>
          )}

          {!createdBatchId ? (
            <Button
              onClick={handleCreate}
              disabled={!classId || !subjectId || !termId || isCreating}
              className="w-full"
            >
              {isCreating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating…
                </>
              ) : (
                "Create Score Sheet"
              )}
            </Button>
          ) : (
            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                onClick={handlePrint}
                className="flex-1"
              >
                <FileDown className="mr-2 h-4 w-4" />
                Print Blank Sheet
              </Button>
              <Button onClick={handleProceed} className="flex-1">
                Continue to Upload
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
