"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { PrintControls } from "@/components/printing/PrintControls";
import { BatchPrintModal } from "@/components/printing/BatchPrintModal";
import { useClassStudents } from "@/hooks/useStudents";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import type { StudentInfo } from "@/types/printing";

export default function BatchPrintPage() {
  const router = useRouter();
  const [showBatchModal, setShowBatchModal] = useState(false);
  const [selectedClassId, setSelectedClassId] = useState("");
  const [selectedTermId, setSelectedTermId] = useState("");

  const { data: classStudents, loading: studentsLoading } =
    useClassStudents(selectedClassId);

  const batchStudents: StudentInfo[] = (classStudents || []).map((s) => ({
    id: s.id,
    full_name: s.full_name,
    admission_number: s.admission_number ?? null,
    avatar_url: null,
  }));

  const handlePrintIndividual = useCallback(
    (classId: string, termId: string) => {
      router.push(
        `/dashboard/admin/reports/student/select?classId=${classId}&termId=${termId}`
      );
    },
    [router]
  );

  const handlePrintClassResult = useCallback(
    (classId: string, termId: string) => {
      router.push(
        `/dashboard/admin/reports/class/${classId}/print?termId=${termId}`
      );
    },
    [router]
  );

  const handleOpenBatchPrint = useCallback(
    (classId: string, termId: string) => {
      setSelectedClassId(classId);
      setSelectedTermId(termId);
      setShowBatchModal(true);
    },
    []
  );

  const handleBatchPrint = useCallback(
    (studentIds: string[]) => {
      if (studentIds.length === 0) return;

      const params = new URLSearchParams();
      studentIds.forEach((id) => params.append("studentIds", id));
      params.append("termId", selectedTermId);
      params.append("classId", selectedClassId);

      const printWindow = window.open(
        `/dashboard/admin/reports/batch/print?${params.toString()}`,
        "_blank"
      );

      if (printWindow) printWindow.focus();
      setShowBatchModal(false);
    },
    [selectedClassId, selectedTermId]
  );

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Batch Print Report Cards
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Select a class and term, then choose which students to print.
          </p>
        </div>
        <Link
          href="/dashboard/admin/reports"
          className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Reports
        </Link>
      </div>

      {/* Controls */}
      <PrintControls
        onPrintIndividual={handlePrintIndividual}
        onPrintClassResult={handlePrintClassResult}
        onPrintBatch={handleOpenBatchPrint}
      />

      {/* Batch Modal */}
      <BatchPrintModal
        isOpen={showBatchModal}
        onClose={() => setShowBatchModal(false)}
        onPrint={handleBatchPrint}
        students={batchStudents}
        isLoading={studentsLoading}
        classId={selectedClassId}
        termId={selectedTermId}
      />
    </div>
  );
}
