"use client";

import { useParams } from "next/navigation";
import { useTeacherClasses } from "@/hooks/useClasses";
import { useFormClassSubjects } from "@/hooks/useFormClassSubjects";
import { ScoreEntryMatrix } from "@/components/scores/ScoreEntryMatrix";
import { useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Eye } from "lucide-react";

export default function FormClassViewPage() {
  const params = useParams();
  const classIdParam = params.classId as string;
  const { data: classes, loading: classesLoading } = useTeacherClasses();
  const { activeSubjects, loading: subjectsLoading } = useFormClassSubjects(classIdParam);
  const [selectedSubjectId, setSelectedSubjectId] = useState("");

  // Auto-select first subject
  useEffect(() => {
    if (activeSubjects.length > 0 && !selectedSubjectId) {
      setSelectedSubjectId(activeSubjects[0].id);
    }
  }, [activeSubjects, selectedSubjectId]);

  const selectedClassId = classIdParam;
  const isLoading = classesLoading || subjectsLoading;

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  const selectedClass = classes.find((c) => c.id === selectedClassId);

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-bold tracking-tight">
            {selectedClass?.name || "Class"} — Overview
          </h2>
          <span className="inline-flex items-center gap-1 px-3 py-1 text-xs font-medium rounded-full bg-amber-100 text-amber-700 border border-amber-200">
            <Eye className="h-3 w-3" />
            Read-Only
          </span>
        </div>
        <p className="text-muted-foreground">
          Viewing all subjects and scores for this class. You cannot edit scores here.
        </p>
      </div>

      {/* Subject Selector */}
      <div className="flex items-center gap-4">
        <div className="space-y-1">
          <Label htmlFor="subject-select">Subject</Label>
          <Select
            value={selectedSubjectId}
            onValueChange={setSelectedSubjectId}
          >
            <SelectTrigger id="subject-select" className="w-[250px]">
              <SelectValue placeholder="Select a subject" />
            </SelectTrigger>
            <SelectContent>
              {activeSubjects.map((subject) => (
                <SelectItem key={subject.id} value={subject.id}>
                  {subject.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="text-sm text-muted-foreground mt-6">
          {activeSubjects.length} subject{activeSubjects.length !== 1 ? "s" : ""} active
        </div>
      </div>

      <ScoreEntryMatrix
        key={`${selectedClassId}-${selectedSubjectId}`}
        classes={classes}
        selectedClassId={selectedClassId}
        selectedSubjectId={selectedSubjectId}
        onClassChange={() => {}}
        onSubjectChange={setSelectedSubjectId}
        subjects={activeSubjects}
        readOnly={true}
      />
    </div>
  );
}