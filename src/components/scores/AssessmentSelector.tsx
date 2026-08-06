// components/scores/AssessmentSelector.tsx
"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Assessment } from "@/types";

interface AssessmentSelectorProps {
  assessments: Assessment[];
  value: string;
  onChange: (assessmentId: string) => void;
}

export function AssessmentSelector({
  assessments,
  value,
  onChange,
}: AssessmentSelectorProps) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-56">
        <SelectValue placeholder="Filter by assessment" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All Assessments</SelectItem>
        {assessments.map((a) => (
          <SelectItem key={a.id} value={a.id}>
            {a.name} (Max: {a.max_score})
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
