"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Printer, Users } from "lucide-react";
import { useClassesDropdownContext } from "@/app/(dashboard)/dashboard/admin/reports/layout";

interface PrintControlsProps {
  onPrintIndividual: (classId: string, termId: string) => void;
  onPrintClassResult: (classId: string, termId: string) => void;
  onPrintBatch: (classId: string, termId: string) => void;
  /**
   * Optional. Fires whenever the class or term selection changes.
   * Parent components use this to sync the selection to the URL.
   */
  onSelectionChange?: (classId: string, termId: string) => void;
  /**
   * Optional. Initial class/term selection. If provided, overrides the
   * auto-select behavior (which uses the current term and first class).
   */
  initialClassId?: string;
  initialTermId?: string;
}

export function PrintControls({
  onPrintIndividual,
  onPrintClassResult,
  onPrintBatch,
  onSelectionChange,
  initialClassId,
  initialTermId,
}: PrintControlsProps) {
  // Dropdown data comes from the ReportsLayout provider — one fetch for the
  // whole section.
  const { data: dropdownData, isLoading } = useClassesDropdownContext();
  const [selectedClass, setSelectedClass] = useState<string>(
    initialClassId || ""
  );
  const [selectedTerm, setSelectedTerm] = useState<string>(
    initialTermId || ""
  );

  // Auto-select: prefer initial props, then current term + first class.
  useEffect(() => {
    if (!dropdownData) return;

    if (!selectedClass && dropdownData.classes.length > 0) {
      setSelectedClass(initialClassId || dropdownData.classes[0].id);
    }

    if (!selectedTerm && dropdownData.terms.length > 0) {
      if (initialTermId) {
        setSelectedTerm(initialTermId);
      } else {
        // Prefer the term flagged `is_current`; otherwise fall back to the
        // first term (the API orders terms by start_date desc, so [0] is
        // the most recent).
        const current = dropdownData.terms.find((t) => t.is_current);
        setSelectedTerm(current?.id || dropdownData.terms[0].id);
      }
    }
  }, [dropdownData, selectedClass, selectedTerm, initialClassId, initialTermId]);

  // Notify parent of changes so it can sync to URL.
  useEffect(() => {
    if (selectedClass && selectedTerm && onSelectionChange) {
      onSelectionChange(selectedClass, selectedTerm);
    }
  }, [selectedClass, selectedTerm, onSelectionChange]);

  if (isLoading) {
    return (
      <div className="text-center py-6 text-sm text-gray-500">
        Loading classes and terms...
      </div>
    );
  }

  return (
    <div className="print-controls no-print">
      <div className="control-group">
        <Label htmlFor="class-select">Class</Label>
        <Select value={selectedClass} onValueChange={setSelectedClass}>
          <SelectTrigger id="class-select" className="w-[200px]">
            <SelectValue placeholder="Select class" />
          </SelectTrigger>
          <SelectContent>
            {dropdownData?.classes.map((cls) => (
              <SelectItem key={cls.id} value={cls.id}>
                {cls.name} ({cls.student_count} students)
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="control-group">
        <Label htmlFor="term-select">Term</Label>
        <Select value={selectedTerm} onValueChange={setSelectedTerm}>
          <SelectTrigger id="term-select" className="w-[220px]">
            <SelectValue placeholder="Select term" />
          </SelectTrigger>
          <SelectContent>
            {dropdownData?.terms.map((term) => (
              <SelectItem key={term.id} value={term.id}>
                {term.name} — {term.academic_session}{" "}
                {term.is_current && "(Current)"}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="control-group" style={{ alignSelf: "flex-end" }}>
        <div className="flex gap-2">
          <Button
            onClick={() => onPrintIndividual(selectedClass, selectedTerm)}
            disabled={!selectedClass || !selectedTerm}
            variant="default"
            size="sm"
          >
            <Printer className="mr-2 h-4 w-4" />
            Print Individual
          </Button>

          <Button
            onClick={() => onPrintClassResult(selectedClass, selectedTerm)}
            disabled={!selectedClass || !selectedTerm}
            variant="outline"
            size="sm"
          >
            <Printer className="mr-2 h-4 w-4" />
            Print Class Sheet
          </Button>

          <Button
            onClick={() => onPrintBatch(selectedClass, selectedTerm)}
            disabled={!selectedClass || !selectedTerm}
            variant="secondary"
            size="sm"
          >
            <Users className="mr-2 h-4 w-4" />
            Batch Print
          </Button>
        </div>
      </div>
    </div>
  );
}
