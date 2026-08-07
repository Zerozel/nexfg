"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Printer, ArrowLeft } from "lucide-react";
import Link from "next/link";
import type { IndividualReportCardData } from "@/types/printing";
import { transformStudentReportData } from "@/lib/printing/data-transform";
import { ReportCardTemplate } from "@/components/printing/ReportCardTemplate";

export default function BatchPrintViewPage() {
  const searchParams = useSearchParams();
  const [reportCards, setReportCards] = useState<
    IndividualReportCardData[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const studentIds = searchParams.getAll("studentIds");
  const termId = searchParams.get("termId") || "";
  const classId = searchParams.get("classId") || "";

  useEffect(() => {
    const fetchBatchData = async () => {
      if (studentIds.length === 0 || !termId || !classId) {
        setError("Missing required parameters");
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch("/api/report-cards/batch", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            student_ids: studentIds,
            term_id: termId,
            class_id: classId,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to fetch batch data");
        }

        const result = await response.json();

        if (result.success && result.data) {
          const transformed = result.data.students.map((student: { student: { id: string; full_name: string; admission_number: string | null; avatar_url: string | null }; subjects: unknown[]; overall: { average: number; position: number; total_students: number; total_subjects: number; grade: string | null; remarks: string | null }; issued_date: string }) =>
            transformStudentReportData({
              school: result.data.school,
              student: student.student,
              class: result.data.class,
              term: result.data.term,
              compiled_results: {
                subjects: student.subjects || [],
                average: student.overall?.average || 0,
                position: student.overall?.position || 0,
                total_students:
                  student.overall?.total_students ||
                  result.data.students.length,
                grade: student.overall?.grade || null,
                remarks: student.overall?.remarks || null,
              },
              issued_date: student.issued_date || result.data.issued_date,
            })
          );
          setReportCards(transformed);
        } else {
          throw new Error("Invalid response format");
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load batch data"
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchBatchData();
  }, [studentIds, termId, classId]);

  // Auto-open print dialog
  useEffect(() => {
    if (reportCards.length > 0 && !isLoading) {
      const timer = setTimeout(() => {
        window.print();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [reportCards, isLoading]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-gray-600">Loading report cards...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-red-500 text-lg mb-4">⚠️ {error}</div>
          <Link
            href="/report-cards/batch"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Batch Print
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Print content */}
      <div className="print-content">
        {reportCards.map((reportCard, index) => (
          <div
            key={reportCard.student.id}
            className={index > 0 ? "page-break" : ""}
          >
            <ReportCardTemplate data={reportCard} />
          </div>
        ))}
      </div>

      {/* Screen controls */}
      <div className="no-print fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg p-4 flex justify-center gap-4 z-50">
        <Button
          onClick={() => window.print()}
          size="lg"
        >
          <Printer className="mr-2 h-5 w-5" />
          Print All Report Cards ({reportCards.length})
        </Button>
        <Link
          href="/report-cards/batch"
          className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
        >
          <ArrowLeft className="mr-2 h-5 w-5" />
          Back to Selection
        </Link>
      </div>
    </>
  );
}
