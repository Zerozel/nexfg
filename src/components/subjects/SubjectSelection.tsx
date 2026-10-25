// src/components/subjects/SubjectSelection.tsx
"use client";

import { useState, useEffect } from "react";
import { useFormClassSubjects } from "@/hooks/useFormClassSubjects";
import { useSchoolTeachers } from "@/hooks/useSchoolTeachers";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { X, UserPlus } from "lucide-react";

interface SubjectSelectionProps {
  classId: string;
  className: string;
  apiBase?: string;
}

export function SubjectSelection({
  classId,
  className,
  apiBase = "/api/teacher",
}: SubjectSelectionProps) {
  const {
    activeSubjects,
    availableSubjects,
    loading,
    error,
    refetch,
  } = useFormClassSubjects(classId);
  const { data: teachers, loading: teachersLoading } = useSchoolTeachers();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);
  const [selectedSubjectId, setSelectedSubjectId] = useState("");
  const [selectedTeacherId, setSelectedTeacherId] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setSelectedIds(activeSubjects.map((s) => s.id));
  }, [activeSubjects]);

  const allSubjects = [...activeSubjects, ...availableSubjects];

  const handleToggle = (subjectId: string, checked: boolean) => {
    if (checked) {
      setSelectedIds([...selectedIds, subjectId]);
    } else {
      setSelectedIds(selectedIds.filter((id) => id !== subjectId));
    }
  };

  const handleSave = async () => {
    const wasEmpty = activeSubjects.length === 0;
    setIsSaving(true);
    try {
      const response = await fetch(`${apiBase}/form-class-subjects`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          class_id: classId,
          subject_ids: selectedIds,
        }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "Failed to save");
      }

      toast({
        title: "Success",
        description:
          selectedIds.length === 0
            ? "Subjects cleared."
            : `Subjects updated: ${selectedIds.length} active`,
      });

      if (wasEmpty && selectedIds.length > 0) {
        setTimeout(() => {
          toast({
            title: "Next step",
            description:
              "Assign a teacher to each subject using the Assign button.",
            duration: 5000,
          });
        }, 500);
      }

      refetch();
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleOpenAssign = (subjectId: string) => {
    setSelectedSubjectId(subjectId);
    setSelectedTeacherId("");
    setDialogOpen(true);
  };

  const handleAssign = async () => {
    if (!selectedSubjectId || !selectedTeacherId) {
      toast({
        title: "Error",
        description: "Please select both a subject and a teacher.",
        variant: "destructive",
      });
      return;
    }

    setIsAssigning(true);
    try {
      const response = await fetch(`${apiBase}/assign-subject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          class_id: classId,
          subject_id: selectedSubjectId,
          teacher_id: selectedTeacherId,
        }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "Failed to assign teacher");
      }

      toast({
        title: "Success",
        description: "Teacher assigned to subject successfully.",
      });
      setSelectedSubjectId("");
      setSelectedTeacherId("");
      setDialogOpen(false);
      refetch();
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setIsAssigning(false);
    }
  };

  const handleRemove = async (subjectId: string) => {
    try {
      const response = await fetch(`${apiBase}/remove-subject`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          class_id: classId,
          subject_id: subjectId,
        }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "Failed to remove teacher");
      }

      toast({
        title: "Success",
        description: "Teacher removed from subject.",
      });
      refetch();
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12 border rounded-lg bg-red-50">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
          {className}
        </h2>
        <p className="text-xs sm:text-sm text-muted-foreground">
          Select subjects and assign Subject Teachers for this class.
        </p>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm sm:text-base">
            Subjects &amp; Subject Teachers
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3">
            {allSubjects.map((subject) => {
              const isActive = selectedIds.includes(subject.id);
              const assignedTeacherId = subject.teacher_id || null;
              const teacherName =
                teachers?.find((t) => t.id === assignedTeacherId)?.full_name ||
                "Not Assigned";
              const isAssigned = !!assignedTeacherId;

              return (
                <div
                  key={subject.id}
                  className="border rounded-lg p-3 sm:p-3 bg-white"
                >
                  {/* Mobile: stacked. Desktop: horizontal. */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    {/* Checkbox + name */}
                    <div className="flex items-center space-x-3 flex-1 min-w-0">
                      <Checkbox
                        id={subject.id}
                        checked={isActive}
                        onCheckedChange={(checked) =>
                          handleToggle(subject.id, checked === true)
                        }
                        className="flex-shrink-0"
                      />
                      <Label
                        htmlFor={subject.id}
                        className="cursor-pointer min-w-0"
                      >
                        <span className="font-medium text-sm truncate block">
                          {subject.name}
                        </span>
                        {subject.code && (
                          <span className="text-xs text-muted-foreground block sm:inline sm:ml-2">
                            {subject.code}
                          </span>
                        )}
                      </Label>
                    </div>

                    {/* Teacher + actions */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 sm:flex-shrink-0">
                      <div className="text-xs sm:text-sm">
                        <span className="text-muted-foreground">
                          Teacher:{" "}
                        </span>
                        <span
                          className={
                            isAssigned
                              ? "font-medium text-green-600"
                              : "text-gray-400"
                          }
                        >
                          {teacherName}
                        </span>
                      </div>

                      {isActive && (
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenAssign(subject.id)}
                            className="flex-1 sm:flex-initial"
                          >
                            <UserPlus className="h-4 w-4 mr-1 flex-shrink-0" />
                            {isAssigned ? "Change" : "Assign"}
                          </Button>
                          {isAssigned && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleRemove(subject.id)}
                              className="text-red-500 hover:text-red-700 flex-shrink-0"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-4 border-t">
            <span className="text-xs sm:text-sm text-muted-foreground">
              {selectedIds.length} of {allSubjects.length} subjects active
            </span>
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="w-full sm:w-auto"
            >
              {isSaving
                ? "Saving..."
                : activeSubjects.length === 0
                ? "Save Subjects"
                : "Save Changes"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-[92vw] sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Assign Teacher to Subject</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Select
              value={selectedSubjectId}
              onValueChange={setSelectedSubjectId}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a subject" />
              </SelectTrigger>
              <SelectContent>
                {allSubjects.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={selectedTeacherId}
              onValueChange={setSelectedTeacherId}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a teacher" />
              </SelectTrigger>
              <SelectContent>
                {teachersLoading ? (
                  <SelectItem value="loading" disabled>
                    Loading...
                  </SelectItem>
                ) : (
                  teachers?.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.full_name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            <Button
              onClick={handleAssign}
              disabled={isAssigning}
              className="w-full"
            >
              {isAssigning ? "Assigning..." : "Assign Teacher"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
