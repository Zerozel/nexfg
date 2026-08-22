// components/scores/ScoreEntryMatrix.tsx
"use client";

import { useCallback } from "react";
import { useClassStudents } from "@/hooks/useStudents";
import { useAssessments } from "@/hooks/useAssessments";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useScoreSync } from "@/hooks/useScoreSync";
import { STORAGE_KEYS } from "@/lib/storage/keys";
import { getScoreForCell, upsertScore } from "@/lib/storage/scores";
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
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import type { Class, ClassScoreCache } from "@/types";

interface ScoreEntryMatrixProps {
  classes: Class[];
  selectedClassId: string;
  onClassChange: (classId: string) => void;
}

export function ScoreEntryMatrix({
  classes,
  selectedClassId,
  onClassChange,
}: ScoreEntryMatrixProps) {
  const { data: students, loading: studentsLoading } =
    useClassStudents(selectedClassId);
  const { data: assessments, loading: assessmentsLoading } =
    useAssessments(selectedClassId);

  const cacheKey = STORAGE_KEYS.SCORES(selectedClassId);
  const { value: cache } = useLocalStorage<ClassScoreCache | null>(
    cacheKey,
    null
  );

  const {
    sync,
    abort,
    isSyncing,
    lastSyncTime,
    pendingCount,
    progress,
    refreshPendingCount,
  } = useScoreSync(selectedClassId);

  const getScore = useCallback(
    (studentId: string, assessmentId: string): number | null => {
      return getScoreForCell(selectedClassId, studentId, assessmentId);
    },
    [selectedClassId]
  );

  const handleScoreChange = useCallback(
    (studentId: string, assessmentId: string, score: number | null) => {
      upsertScore(selectedClassId, studentId, assessmentId, score);
      // Force refresh of pending count
      setTimeout(refreshPendingCount, 100);
    },
    [selectedClassId, refreshPendingCount]
  );

  const isLoading = studentsLoading || assessmentsLoading;

  return (
    <AutoSyncHandler classId={selectedClassId} onReconnect={sync}>
      <div className="space-y-4">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <ClassSelector
              classes={classes}
              value={selectedClassId}
              onChange={onClassChange}
            />
            {assessments.length > 0 && (
              <Badge variant="secondary">
                {assessments.length} assessment
                {assessments.length !== 1 ? "s" : ""}
              </Badge>
            )}
          </div>
          <SyncStatusBar
            pendingCount={pendingCount}
            isSyncing={isSyncing}
            onSync={sync}
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
        ) : students.length === 0 ? (
          <div className="text-center py-12 border rounded-lg bg-white">
            <p className="text-gray-500">
              {selectedClassId
                ? "No students found in this class."
                : "Select a class to begin entering scores."}
            </p>
          </div>
        ) : assessments.length === 0 ? (
          <div className="text-center py-12 border rounded-lg bg-white">
            <p className="text-gray-500">
              No assessments found for this class. Contact your admin.
            </p>
          </div>
        ) : (
          <div className="border rounded-lg bg-white overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="sticky left-0 bg-gray-50 z-10 min-w-[180px]">
                      Student
                    </TableHead>
                    {assessments.map((assessment) => (
                      <TableHead
                        key={assessment.id}
                        className="text-center min-w-[100px]"
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
                    />
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}

        {/* Legend */}
        <div className="flex items-center gap-4 text-xs text-gray-400">
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
      </div>
    </AutoSyncHandler>
  );
}
