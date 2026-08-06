// components/scores/ClassSelector.tsx
"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Class } from "@/types";

interface ClassSelectorProps {
  classes: Class[];
  value: string;
  onChange: (classId: string) => void;
}

export function ClassSelector({
  classes,
  value,
  onChange,
}: ClassSelectorProps) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-56">
        <SelectValue placeholder="Select a class" />
      </SelectTrigger>
      <SelectContent>
        {classes.length === 0 ? (
          <div className="px-2 py-4 text-sm text-gray-400 text-center">
            No classes assigned
          </div>
        ) : (
          classes.map((cls) => (
            <SelectItem key={cls.id} value={cls.id}>
              {cls.name}
              {cls.section ? ` (${cls.section})` : ""}
            </SelectItem>
          ))
        )}
      </SelectContent>
    </Select>
  );
}
