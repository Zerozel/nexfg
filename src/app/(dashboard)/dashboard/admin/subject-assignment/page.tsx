// src/app/(dashboard)/dashboard/admin/subject-assignment/page.tsx
"use client";

import { useState, useEffect } from "react";
import {
  Loader2,
  CheckCircle2,
  Users,
  LayoutGrid,
  ExternalLink,
} from "lucide-react";
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
import { useToast } from "@/components/ui/use-toast";
import { useAdminClasses } from "@/hooks/useClasses";
import {
  useAdminSubjectAssignment,
  assignTeacher,
} from "@/hooks/useAdminSubjectAssignment";

export default function AdminSubjectAssignmentPage() {
  const { toast } = useToast();
  const { data: classesData, isLoading: loadingClasses } = useAdminClasses({
    pageSize: 200,
  });

  const [baseName, setBaseName] = useState("");
  const [isBulkSaving, setIsBulkSaving] = useState(false);
  const [bulkSubject, setBulkSubject] = useState("");
  const [bulkTeacher, setBulkTeacher] = useState("");
  const [pendingCells, setPendingCells] = useState<Set<string>>(new Set());

  const {
    data: matrix,
    isLoading,
    error,
    refetch,
  } = useAdminSubjectAssignment(baseName || null);

  const baseNames = Array.from(
    new Set(
      (classesData?.data || [])
        .map((c: any) => c.base_name)
        .filter(Boolean)
    )
  ).sort() as string[];

  useEffect(() => {
    if (baseNames.length > 0 && !baseName) {
      setBaseName(baseNames[0]);
    }
  }, [baseNames, baseName]);

  const markPending = (key: string) =>
    setPendingCells((prev) => new Set(prev).add(key));

  const clearPending = (key: string) =>
    setPendingCells((prev) => {
      const next = new Set(prev);
      next.delete(key);
      return next;
    });

  const handleCellChange = async (
    subjectId: string,
    armId: string,
    teacherId: string | null
  ) => {
    const key = `${subjectId}:${armId}`;
    markPending(key);
    try {
      await assignTeacher({
        class_id: armId,
        subject_id: subjectId,
        teacher_id: teacherId,
      });
      await refetch();
    } catch (err: any) {
      toast({
        title: "Assignment failed",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      clearPending(key);
    }
  };

  const handleBulkApply = async () => {
    if (!bulkSubject || !baseName) return;
    setIsBulkSaving(true);
    try {
      const result = await assignTeacher({
        base_name: baseName,
        subject_id: bulkSubject,
        teacher_id: bulkTeacher || null,
      });
      await refetch();
      toast({
        title: bulkTeacher ? "Assigned" : "Unassigned",
        description: `${
          bulkTeacher ? "Applied to" : "Removed from"
        } ${result.affected} arm${result.affected !== 1 ? "s" : ""}.`,
      });
      setBulkSubject("");
      setBulkTeacher("");
    } catch (err: any) {
      toast({
        title: "Bulk action failed",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setIsBulkSaving(false);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
          Subject Assignment
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-1">
          Assign subjects and teachers across every arm of a class in one view.
          Once assigned, the subject stays with the class — no need to re-enter
          every term or year.
        </p>
      </div>

      {/* Class group selector */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm sm:text-base">Class Group</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <Label className="sm:w-20 text-sm">Group</Label>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 flex-1">
              <Select value={baseName} onValueChange={setBaseName}>
                <SelectTrigger className="w-full sm:w-[240px]">
                  <SelectValue
                    placeholder={loadingClasses ? "Loading…" : "Select a group"}
                  />
                </SelectTrigger>
                <SelectContent>
                  {baseNames.map((b) => (
                    <SelectItem key={b} value={b}>
                      {b}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {matrix && (
                <span className="text-xs sm:text-sm text-muted-foreground">
                  {matrix.arms.length} arm
                  {matrix.arms.length !== 1 ? "s" : ""} ·{" "}
                  {matrix.subjects.length} subject
                  {matrix.subjects.length !== 1 ? "s" : ""}
                </span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bulk apply */}
      {matrix && matrix.arms.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-gray-500 flex-shrink-0" />
              <CardTitle className="text-sm sm:text-base">
                Assign one teacher to every arm
              </CardTitle>
            </div>
            <CardDescription className="text-xs sm:text-sm">
              Pick a subject and teacher — every arm in this group gets the
              same assignment in one click.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-3">
              <div className="space-y-2">
                <Label className="text-sm">Subject</Label>
                <Select value={bulkSubject} onValueChange={setBulkSubject}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select subject" />
                  </SelectTrigger>
                  <SelectContent>
                    {matrix.subjects.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-sm">
                  Teacher (leave blank to unassign)
                </Label>
                <Select value={bulkTeacher} onValueChange={setBulkTeacher}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Unassign" />
                  </SelectTrigger>
                  <SelectContent>
                    {matrix.teachers.map((t) => (
                      <SelectItem key={t.id} value={t.id}>
                        {t.full_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button
                onClick={handleBulkApply}
                disabled={!bulkSubject || isBulkSaving}
                className="w-full sm:w-auto sm:self-end"
              >
                {isBulkSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Applying…
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    {bulkTeacher ? "Apply to all arms" : "Unassign from all"}
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Matrix */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <LayoutGrid className="h-4 w-4 text-gray-500 flex-shrink-0" />
            <CardTitle className="text-sm sm:text-base">
              Per-arm matrix
            </CardTitle>
          </div>
          <CardDescription className="text-xs sm:text-sm">
            <span className="hidden lg:inline">
              Change any cell to assign that specific arm. Click a dropdown to
              pick a teacher or unassign.
            </span>
            <span className="lg:hidden">
              Tap a teacher name to change or unassign the teacher for that arm.
            </span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
            </div>
          ) : error ? (
            <p className="text-center py-12 text-sm text-red-600">{error}</p>
          ) : !matrix ? (
            <p className="text-center py-12 text-sm text-muted-foreground">
              Select a class group above.
            </p>
          ) : matrix.subjects.length === 0 ? (
            <p className="text-center py-12 text-sm text-muted-foreground">
              No subjects in your school yet. Create subjects first.
            </p>
          ) : (
            <>
              {/* ═══ Mobile / tablet: stacked cards ═══ */}
              <div className="lg:hidden space-y-3">
                {matrix.subjects.map((subject) => (
                  <div
                    key={subject.id}
                    className="border rounded-lg p-3 bg-white"
                  >
                    <div className="mb-3">
                      <div className="font-semibold text-sm text-gray-900">
                        {subject.name}
                      </div>
                      {subject.code && (
                        <div className="text-xs text-gray-400">
                          {subject.code}
                        </div>
                      )}
                    </div>
                    <div className="space-y-2">
                      {matrix.arms.map((arm) => {
                        const cell = subject.per_arm[arm.id];
                        const key = `${subject.id}:${arm.id}`;
                        const isPending = pendingCells.has(key);
                        const cellValue = cell?.teacher_id || "";

                        return (
                          <div
                            key={arm.id}
                            className="flex items-center gap-2"
                          >
                            <span className="text-xs font-medium text-gray-600 w-16 flex-shrink-0">
                              {arm.name}
                            </span>
                            <Select
                              value={cellValue || "__none__"}
                              onValueChange={(v) =>
                                handleCellChange(
                                  subject.id,
                                  arm.id,
                                  v === "__none__" ? null : v
                                )
                              }
                              disabled={isPending}
                            >
                              <SelectTrigger
                                className={`h-9 text-xs flex-1 ${
                                  !cellValue
                                    ? "text-gray-400"
                                    : "text-green-700 font-medium"
                                }`}
                              >
                                {isPending ? (
                                  <div className="flex items-center gap-1">
                                    <Loader2 className="h-3 w-3 animate-spin" />
                                    <span>Saving…</span>
                                  </div>
                                ) : (
                                  <SelectValue placeholder="Unassigned" />
                                )}
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="__none__">
                                  <span className="text-gray-400">
                                    — Unassigned —
                                  </span>
                                </SelectItem>
                                {matrix.teachers.map((t) => (
                                  <SelectItem key={t.id} value={t.id}>
                                    {t.full_name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              {/* ═══ Desktop: table ═══ */}
              <div className="hidden lg:block overflow-x-auto -mx-6 px-6">
                <table className="w-full border-collapse text-sm min-w-[600px]">
                  <thead>
                    <tr className="border-b bg-gray-50">
                      <th className="text-left p-3 sticky left-0 bg-gray-50 z-10 min-w-[180px]">
                        Subject
                      </th>
                      {matrix.arms.map((arm) => (
                        <th
                          key={arm.id}
                          className="text-left p-3 min-w-[200px] font-medium"
                        >
                          {arm.name}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {matrix.subjects.map((subject) => (
                      <tr
                        key={subject.id}
                        className="border-b hover:bg-gray-50"
                      >
                        <td className="p-3 sticky left-0 bg-white z-10">
                          <div className="font-medium">{subject.name}</div>
                          {subject.code && (
                            <div className="text-xs text-gray-400">
                              {subject.code}
                            </div>
                          )}
                        </td>
                        {matrix.arms.map((arm) => {
                          const cell = subject.per_arm[arm.id];
                          const key = `${subject.id}:${arm.id}`;
                          const isPending = pendingCells.has(key);
                          const cellValue = cell?.teacher_id || "";

                          return (
                            <td key={arm.id} className="p-2">
                              <Select
                                value={cellValue || "__none__"}
                                onValueChange={(v) =>
                                  handleCellChange(
                                    subject.id,
                                    arm.id,
                                    v === "__none__" ? null : v
                                  )
                                }
                                disabled={isPending}
                              >
                                <SelectTrigger
                                  className={`h-9 text-xs ${
                                    !cellValue
                                      ? "text-gray-400"
                                      : "text-green-700 font-medium"
                                  }`}
                                >
                                  {isPending ? (
                                    <div className="flex items-center gap-1">
                                      <Loader2 className="h-3 w-3 animate-spin" />
                                      <span>Saving…</span>
                                    </div>
                                  ) : (
                                    <SelectValue placeholder="Unassigned" />
                                  )}
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="__none__">
                                    <span className="text-gray-400">
                                      — Unassigned —
                                    </span>
                                  </SelectItem>
                                  {matrix.teachers.map((t) => (
                                    <SelectItem key={t.id} value={t.id}>
                                      {t.full_name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Per-arm editor link */}
      {matrix && matrix.arms.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm sm:text-base">
              Need the full per-class editor?
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Use the per-arm view to toggle subjects on or off for a single
              arm, or to assign a form teacher.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:flex lg:flex-wrap gap-2">
              {matrix.arms.map((arm) => (
                <Button
                  key={arm.id}
                  variant="outline"
                  size="sm"
                  className="w-full sm:w-auto justify-center"
                  onClick={() =>
                    window.open(
                      `/dashboard/admin/classes/${arm.id}/subjects`,
                      "_blank"
                    )
                  }
                >
                  Edit {arm.name}
                  <ExternalLink className="ml-1 h-3 w-3 flex-shrink-0" />
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
