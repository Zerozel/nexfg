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
}

export function ScoreRow({
  student,
  assessments,
  getScore,
  onScoreChange,
}: ScoreRowProps) {
  return (
    <TableRow>
      <TableCell className="font-medium whitespace-nowrap min-w-[180px]">
        <div>
          <span>{student.full_name}</span>
          {student.admission_number && (
            <span className="block text-xs text-gray-400">
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
          />
        </TableCell>
      ))}
    </TableRow>
  );
}
