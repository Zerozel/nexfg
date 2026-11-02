"use client";

import { Suspense } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { FileDown, ArrowLeft } from "lucide-react";
import Link from "next/link";

function StudentReportCardPDF() {
  const params = useParams();
  const searchParams = useSearchParams();
  const studentId = params.id as string;
  const termId = searchParams.get("termId") || "";
  const classId = searchParams.get("classId") || "";

  const pdfUrl = `/api/report-cards/student/${studentId}/pdf?termId=${termId}&classId=${classId}`;

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
      <div className="max-w-md w-full bg-white rounded-lg border shadow-sm p-8 text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
          <FileDown className="h-8 w-8 text-green-700" />
        </div>
        <h1 className="text-xl font-bold mb-2">Report Card PDF</h1>
        <p className="text-sm text-gray-600 mb-6">
          Your report card is ready as a PDF. It will open in a new tab.
        </p>

        <div className="space-y-3">
          {/* Native anchor styled like a button — avoids asChild dependency */}
          <a
            href={pdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex w-full items-center justify-center rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            <FileDown className="mr-2 h-5 w-5" />
            Download PDF
          </a>

          <Link
            href="/dashboard/admin/reports"
            className="inline-flex w-full items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Reports
          </Link>
        </div>

        <p className="text-xs text-gray-400 mt-6">
          Same template as the batch PDF — consistent output.
        </p>
      </div>
    </div>
  );
}

export default function StudentReportCardPrintPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      }
    >
      <StudentReportCardPDF />
    </Suspense>
  );
}
