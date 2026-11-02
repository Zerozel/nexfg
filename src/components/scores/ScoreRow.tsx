// components/scores/ScoreRow.tsx
"use client";

import { TableRow, TableCell } from "@/components/ui/table";
import { ScoreCell } from "./ScoreCell";
import type { Student, Assessment } from "@/types";

interface ScoreRowProps {
  student: Student;
  assessments: Assessment[];
  getScore: (studentId: string, assessmentId: string) => number | null;
  onScoreChange: (
    studentId: string,
    assessmentId: string,
    score: number | null
  ) => void;
  readOnly?: boolean;
}

export function ScoreRow({
  student,
  assessments,
  getScore,
  onScoreChange,
  readOnly = false,
}: ScoreRowProps) {
  return (
    <TableRow>
      <TableCell
        className="sticky left-0 z-10 bg-white font-medium min-w-[140px] sm:min-w-[180px] shadow-[2px_0_4px_-2px_rgba(0,0,0,0.1)]"
      >
        <div className="min-w-0">
          <span className="block text-sm truncate">{student.full_name}</span>
          {student.admission_number && (
            <span className="block text-xs text-gray-400 truncate">
              {student.admission_number}
            </span>
          )}
        </div>
      </TableCell>
      {assessments.map((assessment) => (
        <TableCell key={assessment.id} className="py-2 px-2">
          <ScoreCell
            studentId={student.id}
            assessmentId={assessment.id}
            value={getScore(student.id, assessment.id)}
            maxScore={assessment.max_score}
            onChange={(score) =>
              onScoreChange(student.id, assessment.id, score)
            }
            readOnly={readOnly}
          />
        </TableCell>
      ))}
    </TableRow>
  );
}
