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
  readOnly?: boolean;  // ← NEW
}

export function ScoreCell({
  studentId,
  assessmentId,
  value,
  maxScore,
  onChange,
  readOnly = false,  // ← NEW
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
      if (readOnly) return;  // ← NEW: Skip if read-only
      
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

      if (isOutOfRange) return;

      onChange(parsed);
    },
    [maxScore, onChange, readOnly]  // ← NEW
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (readOnly) return;  // ← NEW: Skip if read-only
    
    const rawValue = e.target.value;
    setLocalValue(rawValue);
    setIsDirty(true);

    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    timeoutRef.current = setTimeout(() => {
      validateAndSave(rawValue);
    }, 500);
  };

  const handleBlur = () => {
    if (readOnly) return;  // ← NEW: Skip if read-only
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
        readOnly={readOnly}  // ← NEW: Pass readOnly to input
        className={cn(
          "w-20 text-center transition-colors",
          readOnly && "bg-gray-50 border-gray-200 text-gray-600",  // ← NEW: Read-only styling
          isDirty && !isInvalid && "border-amber-300 bg-amber-50",
          isInvalid && "border-red-300 bg-red-50",
          !isDirty && !isInvalid && localValue !== "" && "border-green-200"
        )}
        placeholder={readOnly ? "" : "−"}  // ← NEW: No placeholder in read-only
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