// components/scores/ScoreCell.tsx
"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface ScoreCellProps {
  studentId: string;
  assessmentId: string;
  value: number | null;
  maxScore: number;
  onChange: (value: number | null) => void;
}

export function ScoreCell({
  studentId,
  assessmentId,
  value,
  maxScore,
  onChange,
}: ScoreCellProps) {
  const [localValue, setLocalValue] = useState<string>(
    value !== null ? String(value) : ""
  );
  const [isDirty, setIsDirty] = useState(false);
  const [isInvalid, setIsInvalid] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prevValueRef = useRef(value);

  // Sync from props when external value changes (e.g. after sync clear)
  useEffect(() => {
    if (value !== prevValueRef.current) {
      prevValueRef.current = value;
      setLocalValue(value !== null ? String(value) : "");
      setIsDirty(false);
      setIsInvalid(false);
    }
  }, [value]);

  const validateAndSave = useCallback(
    (rawValue: string) => {
      if (rawValue === "") {
        setIsInvalid(false);
        setIsDirty(true);
        onChange(null);
        return;
      }

      const parsed = parseFloat(rawValue);
      if (isNaN(parsed)) {
        setIsInvalid(true);
        return;
      }

      const isOutOfRange = parsed < 0 || parsed > maxScore;
      setIsInvalid(isOutOfRange);
      setIsDirty(true);

      // Don't persist values that fail client-side validation. The cell stays
      // visibly "invalid" until corrected, so we never queue a score the server
      // is guaranteed to reject (> max_score or negative).
      if (isOutOfRange) return;

      onChange(parsed);
    },
    [maxScore, onChange]
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    setLocalValue(rawValue);
    setIsDirty(true);

    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    timeoutRef.current = setTimeout(() => {
      validateAndSave(rawValue);
    }, 500);
  };

  const handleBlur = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    validateAndSave(localValue);
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return (
    <div className="relative">
      <Input
        type="number"
        step="0.5"
        min={0}
        max={maxScore}
        value={localValue}
        onChange={handleChange}
        onBlur={handleBlur}
        className={cn(
          "w-20 text-center transition-colors",
          isDirty && !isInvalid && "border-amber-300 bg-amber-50",
          isInvalid && "border-red-300 bg-red-50",
          !isDirty && !isInvalid && localValue !== "" && "border-green-200"
        )}
        placeholder="−"
        aria-label={`Score for student ${studentId}, assessment ${assessmentId}, max ${maxScore}`}
      />
      {isInvalid && (
        <span className="absolute -bottom-4 left-0 text-[10px] text-red-500 whitespace-nowrap">
          Invalid (0–{maxScore})
        </span>
      )}
    </div>
  );
}
