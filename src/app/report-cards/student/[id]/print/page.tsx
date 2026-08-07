"use client";

import { useEffect } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { useReportCard } from "@/hooks/useReportCard";
import { ReportCardTemplate } from "@/components/printing/ReportCardTemplate";
import { Button } from "@/components/ui/button";
import { Printer, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function StudentReportCardPrintPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const studentId = params.id as string;
  const termId = searchParams.get("termId") || "";
  const classId = searchParams.get("classId") || "";

  const { data, isLoading, error } = useReportCard({
    studentId,
    termId,
    classId,
  });

  // Auto-open print dialog
  useEffect(() => {
    if (data && !isLoading) {
      const timer = setTimeout(() => {
        window.print();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [data, isLoading]);

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-gray-600">Loading report card...</p>
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
            href="/dashboard"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-600 mb-4">No report card data found</p>
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Print-only content */}
      <div className="print-content">
        <ReportCardTemplate data={data} />
      </div>

      {/* Screen-only controls */}
      <div className="no-print fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg p-4 flex justify-center gap-4 z-50">
        <Button onClick={handlePrint} size="lg">
          <Printer className="mr-2 h-5 w-5" />
          Print Report Card
        </Button>
        <Link
          href="/dashboard"
          className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
        >
          <ArrowLeft className="mr-2 h-5 w-5" />
          Back to Dashboard
        </Link>
      </div>
    </>
  );
}
