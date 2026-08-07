"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { PrintControls } from "@/components/printing/PrintControls";
import { BatchPrintModal } from "@/components/printing/BatchPrintModal";
import { useClassesDropdown } from "@/hooks/useReportCard";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function BatchPrintPage() {
  const router = useRouter();
  const { data: dropdownData, isLoading } = useClassesDropdown();
  const [showBatchModal, setShowBatchModal] = useState(false);
  const [selectedClassId, setSelectedClassId] = useState("");
  const [selectedTermId, setSelectedTermId] = useState("");

  const handlePrintIndividual = useCallback(
    (classId: string, termId: string) => {
      router.push(
        `/report-cards/student/select?classId=${classId}&termId=${termId}`
      );
    },
    [router]
  );

  const handlePrintClassResult = useCallback(
    (classId: string, termId: string) => {
      router.push(
        `/report-cards/class/${classId}/print?termId=${termId}`
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
        `/report-cards/batch/print?${params.toString()}`,
        "_blank"
      );

      if (printWindow) {
        printWindow.focus();
      }

      setShowBatchModal(false);
    },
    [selectedClassId, selectedTermId]
  );

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">Print Report Cards</h1>
          <p className="text-gray-600 mt-1">
            Print individual, class result sheets, or batch print report
            cards
          </p>
        </div>
        <Link
          href="/dashboard"
          className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Link>
      </div>

      {/* Print Controls */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-gray-600">Loading classes and terms...</p>
        </div>
      ) : (
        <PrintControls
          onPrintIndividual={handlePrintIndividual}
          onPrintClassResult={handlePrintClassResult}
          onPrintBatch={handleOpenBatchPrint}
        />
      )}

      {/* Quick Links */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-6 border rounded-lg hover:shadow-md transition-shadow">
          <h3 className="font-semibold mb-2">Individual Report Card</h3>
          <p className="text-sm text-gray-600 mb-4">
            Print a single student's report card with all subjects, grades, and
            remarks.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              handlePrintIndividual(
                dropdownData?.classes[0]?.id || "",
                dropdownData?.terms[0]?.id || ""
              )
            }
            disabled={!dropdownData?.classes.length}
          >
            Print Individual
          </Button>
        </div>

        <div className="p-6 border rounded-lg hover:shadow-md transition-shadow">
          <h3 className="font-semibold mb-2">Class Result Sheet</h3>
          <p className="text-sm text-gray-600 mb-4">
            Print a summary sheet with all students in a class and their
            results.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              handlePrintClassResult(
                dropdownData?.classes[0]?.id || "",
                dropdownData?.terms[0]?.id || ""
              )
            }
            disabled={!dropdownData?.classes.length}
          >
            Print Class Sheet
          </Button>
        </div>

        <div className="p-6 border rounded-lg hover:shadow-md transition-shadow">
          <h3 className="font-semibold mb-2">Batch Print</h3>
          <p className="text-sm text-gray-600 mb-4">
            Select multiple students and print all their report cards at once.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              handleOpenBatchPrint(
                dropdownData?.classes[0]?.id || "",
                dropdownData?.terms[0]?.id || ""
              )
            }
            disabled={!dropdownData?.classes.length}
          >
            Batch Print
          </Button>
        </div>
      </div>

      {/* Batch Print Modal */}
      <BatchPrintModal
        isOpen={showBatchModal}
        onClose={() => setShowBatchModal(false)}
        onPrint={handleBatchPrint}
        students={[]}
        classId={selectedClassId}
        termId={selectedTermId}
      />
    </div>
  );
}
