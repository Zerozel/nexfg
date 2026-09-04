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
  const [selectedSubjectId, setSelectedSubjectId] = useState("");

  // ✅ Use classIdParam directly without duplicating state
  const selectedClassId = classIdParam;

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
        key={selectedClassId} // ← Force re-mount when class changes
        classes={classes}
        selectedClassId={selectedClassId}
        selectedSubjectId={selectedSubjectId}
        onClassChange={() => {}} // No-op since we use the URL
        onSubjectChange={setSelectedSubjectId}
      />
    </div>
  );
}