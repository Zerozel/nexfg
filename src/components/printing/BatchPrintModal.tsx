"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Printer, X } from "lucide-react";
import type { StudentInfo } from "@/types/printing";

interface BatchPrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPrint: (studentIds: string[]) => void;
  students: StudentInfo[];
  classId: string;
  termId: string;
  /** Whether the student list is still being fetched. */
  isLoading?: boolean;
}

export function BatchPrintModal({
  isOpen,
  onClose,
  onPrint,
  students,
  classId,
  termId,
  isLoading = false,
}: BatchPrintModalProps) {

  const [selectedIds, setSelectedIds] = useState<Set<string>>(
    new Set()
  );

  useEffect(() => {
    setSelectedIds(new Set());
  }, [isOpen]);

  if (!isOpen) return null;

  const handleToggleStudent = (studentId: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(studentId)) {
      newSelected.delete(studentId);
    } else {
      newSelected.add(studentId);
    }
    setSelectedIds(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedIds.size === students.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(students.map((s) => s.id)));
    }
  };

  const handlePrint = () => {
    const ids = Array.from(selectedIds);
    if (ids.length > 0) {
      onPrint(ids);
    }
  };

  return (
    <div className="batch-print-modal no-print">
      <div className="batch-print-content">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">
            Bulk Print — Select Students
          </h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Select All */}
        <div className="select-all">
          <Checkbox
            id="select-all"
            checked={
              selectedIds.size === students.length &&
              students.length > 0
            }
            onCheckedChange={handleSelectAll}
          />
          <label
            htmlFor="select-all"
            className="text-sm font-medium cursor-pointer"
          >
            Select All Students
          </label>
        </div>

        {/* Student List */}
        <div className="student-list">
          {isLoading && (
            <div className="text-center py-8 text-gray-500">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-3" />
              Loading students...
            </div>
          )}

          {!isLoading &&
            students.map((student) => (
              <div
                key={student.id}
                className={`student-item ${
                  selectedIds.has(student.id) ? "selected" : ""
                }`}
                onClick={() => handleToggleStudent(student.id)}
              >
                <Checkbox
                  checked={selectedIds.has(student.id)}
                  onCheckedChange={() => handleToggleStudent(student.id)}
                />
                <div>
                  <div className="font-medium">{student.full_name}</div>
                  {student.admission_number && (
                    <div className="text-sm text-gray-500">
                      {student.admission_number}
                    </div>
                  )}
                </div>
              </div>
            ))}

          {!isLoading && students.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No students found in this class
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t">
          <p className="text-sm text-gray-600">
            Selected:{" "}
            <strong>{selectedIds.size} students</strong>
          </p>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              onClick={handlePrint}
              disabled={selectedIds.size === 0}
            >
              <Printer className="mr-2 h-4 w-4" />
              Print Selected
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
