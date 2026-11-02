// components/scores/ScoreEntryMatrix.tsx
"use client";

import { useCallback, useEffect, useState } from "react";
import { useClassStudents } from "@/hooks/useClassStudents";
import { useAssessments } from "@/hooks/useAssessments";
import { useScoreSync } from "@/hooks/useScoreSync";
import { useCurrentTerm } from "@/hooks/useCurrentTerm";
import { getScoresForClass, upsertScore } from "@/lib/storage/scores";
import { ClassSelector } from "./ClassSelector";
import { SyncStatusBar } from "./SyncStatusBar";
import { AutoSyncHandler } from "./AutoSyncHandler";
import { ScoreRow } from "./ScoreRow";
import {
  Table,
  TableHeader,
  TableHead,
  TableBody,
  TableRow
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import type { Class } from "@/types";

interface ScoreEntryMatrixProps {
  classes: Class[];
  selectedClassId: string;
  selectedSubjectId: string;
  onClassChange: (classId: string) => void;
  onSubjectChange: (subjectId: string) => void;
  subjects?: { id: string; name: string }[];
  readOnly?: boolean;
}

export function ScoreEntryMatrix({
  classes,
  selectedClassId,
  selectedSubjectId,
  onClassChange,
  onSubjectChange,
  subjects = [],
  readOnly = false,
}: ScoreEntryMatrixProps) {
  const { terms, currentTerm, loading: termsLoading } = useCurrentTerm();
  const [selectedTermId, setSelectedTermId] = useState<string>("");

  useEffect(() => {
    if (!selectedTermId && currentTerm) {
      setSelectedTermId(currentTerm.id);
    }
  }, [currentTerm, selectedTermId]);

  const {
    data: students,
    loading: studentsLoading,
    error: studentsError,
    refetch: refetchStudents
  } = useClassStudents(selectedClassId, {
    subjectId: selectedSubjectId,
    termId: selectedTermId,
  });

  const {
    data: assessments,
    loading: assessmentsLoading,
    refetch: refetchAssessments
  } = useAssessments(selectedClassId, selectedSubjectId, selectedTermId);

  const {
    sync,
    abort,
    isSyncing,
    lastSyncTime,
    pendingCount,
    progress,
    refreshPendingCount,
  } = useScoreSync(selectedClassId);

  const handleSync = useCallback(async () => {
    const result = await sync();
    if (result?.success) {
      await refetchStudents();
      await refetchAssessments();
    }
    return result;
  }, [sync, refetchStudents, refetchAssessments]);

  const getScore = useCallback(
    (studentId: string, assessmentId: string): number | null => {
      const localScore = getScoresForClass(selectedClassId)?.scores.find(
        (score) =>
          score.student_id === studentId && score.assessment_id === assessmentId
      );
      if (localScore) return localScore.score;

      const student = students.find((item) => item.id === studentId);
      return student?.scores?.[assessmentId] ?? null;
    },
    [selectedClassId, students]
  );

  const handleScoreChange = useCallback(
    (studentId: string, assessmentId: string, score: number | null) => {
      if (readOnly) return;
      upsertScore(selectedClassId, studentId, assessmentId, score);
      setTimeout(refreshPendingCount, 100);
    },
    [selectedClassId, refreshPendingCount, readOnly]
  );

  const isLoading = studentsLoading || assessmentsLoading || termsLoading;

  return (
    <AutoSyncHandler classId={selectedClassId} onReconnect={handleSync}>
      <div className="space-y-4">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            <ClassSelector
              classes={classes}
              value={selectedClassId}
              onChange={onClassChange}
            />

            <Select
              value={selectedTermId}
              onValueChange={setSelectedTermId}
            >
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Select a term" />
              </SelectTrigger>
              <SelectContent>
                {terms.length === 0 ? (
                  <div className="px-2 py-4 text-sm text-gray-400 text-center">
                    No terms available
                  </div>
                ) : (
                  terms.map((term) => (
                    <SelectItem key={term.id} value={term.id}>
                      {term.name}
                      {term.is_current ? " (Current)" : ""}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>

            {assessments.length > 0 && (
              <Badge variant="secondary">
                {assessments.length} assessment
                {assessments.length !== 1 ? "s" : ""}
              </Badge>
            )}
            {readOnly && (
              <Badge variant="outline" className="text-amber-600 border-amber-300">
                🔒 Read-Only
              </Badge>
            )}
          </div>
          <SyncStatusBar
            pendingCount={readOnly ? 0 : pendingCount}
            isSyncing={isSyncing}
            onSync={handleSync}
            onCancel={abort}
            lastSyncTime={lastSyncTime}
            progress={progress}
          />
        </div>

        {/* Matrix */}
        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : !selectedTermId ? (
          <div className="text-center py-12 border rounded-lg bg-white">
            <p className="text-gray-500">
              Select a term to begin entering scores.
            </p>
          </div>
        ) : studentsError ? (
          <div className="text-center py-12 border rounded-lg bg-red-50">
            <p className="text-red-600">{studentsError}</p>
          </div>
        ) : students.length === 0 ? (
          <div className="text-center py-12 border rounded-lg bg-white">
            <p className="text-gray-500">
              {selectedClassId
                ? "No students found in this class."
                : "Select a class to begin entering scores."}
            </p>
          </div>
        ) : assessments.length === 0 ? (
          <div className="text-center py-12 border rounded-lg bg-yellow-50">
            <p className="text-yellow-700">
              No assessments found for this class, subject, and term.
            </p>
            <p className="text-sm text-yellow-600 mt-2">
              Ask an administrator to assign this subject to the class.
            </p>
          </div>
        ) : (
          <div className="border rounded-lg bg-white overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="sticky top-0 z-20">
                  <TableRow>
                    <TableHead
                      className="sticky left-0 top-0 z-30 bg-gray-50 min-w-[140px] sm:min-w-[180px] shadow-[2px_0_4px_-2px_rgba(0,0,0,0.1)]"
                    >
                      Student
                    </TableHead>
                    {assessments.map((assessment) => (
                      <TableHead
                        key={assessment.id}
                        className="text-center min-w-[80px] sm:min-w-[100px] bg-gray-50"
                      >
                        <div>
                          <span className="block text-xs font-medium">
                            {assessment.name}
                          </span>
                          <span className="block text-[10px] text-gray-400 font-normal">
                            Max: {assessment.max_score}
                          </span>
                        </div>
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {students.map((student) => (
                    <ScoreRow
                      key={student.id}
                      student={student}
                      assessments={assessments}
                      getScore={getScore}
                      onScoreChange={handleScoreChange}
                      readOnly={readOnly}
                    />
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Mobile scroll hint — only visible below sm */}
            <div className="sm:hidden flex items-center justify-center gap-2 py-2 text-[10px] text-gray-400 bg-gray-50 border-t">
              <span>←</span>
              <span>Swipe to see all scores</span>
              <span>→</span>
            </div>
          </div>
        )}

        {/* Legend */}
        {!readOnly && (
          <div className="flex flex-wrap items-center gap-4 text-xs text-gray-400">
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded border border-amber-300 bg-amber-50" />
              Unsaved
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded border border-green-200" />
              Synced
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded border border-red-300 bg-red-50" />
              Invalid
            </span>
          </div>
        )}
      </div>
    </AutoSyncHandler>
  );
}
