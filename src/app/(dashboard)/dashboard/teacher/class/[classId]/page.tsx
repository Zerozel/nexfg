// src/app/(dashboard)/dashboard/teacher/class/[classId]/page.tsx
"use client";

import { useParams } from "next/navigation";
import { useTeacherClasses } from "@/hooks/useClasses";
import { ScoreEntryMatrix } from "@/components/scores/ScoreEntryMatrix";
import { useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default function ScoreEntryPage() {
  const params = useParams();
  const classIdParam = params.classId as string;
  const { data: classes, loading } = useTeacherClasses();
  const [selectedClassId, setSelectedClassId] = useState(classIdParam || "");

  useEffect(() => {
    if (classIdParam) {
      setSelectedClassId(classIdParam);
    }
  }, [classIdParam]);

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-12 w-full" />
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Score Entry</h2>
      <ScoreEntryMatrix
        classes={classes}
        selectedClassId={selectedClassId}
        onClassChange={setSelectedClassId}
      />
    </div>
  );
}
