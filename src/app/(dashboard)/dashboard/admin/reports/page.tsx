"use client";

import { Suspense, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PrintControls } from "@/components/printing/PrintControls";
import { useClassesDropdownContext } from "./layout";
import { FileText, Table, Users, ArrowLeft } from "lucide-react";

function ReportsHubContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data, isLoading } = useClassesDropdownContext();

  // Initial values pulled from the URL — makes the hub refresh-safe.
  const initialClassId = searchParams.get("classId") || undefined;
  const initialTermId = searchParams.get("termId") || undefined;

  // Sync selection to URL — no navigation, just a silent URL update.
  const handleSelectionChange = useCallback(
    (classId: string, termId: string) => {
      const params = new URLSearchParams();
      params.set("classId", classId);
      params.set("termId", termId);
      router.replace(`/dashboard/admin/reports?${params.toString()}`, {
        scroll: false,
      });
    },
    [router]
  );

  const handlePrintIndividual = (classId: string, termId: string) => {
    router.push(
      `/dashboard/admin/reports/student/select?classId=${classId}&termId=${termId}`
    );
  };

  const handlePrintClassResult = (classId: string, termId: string) => {
    router.push(
      `/dashboard/admin/reports/class/${classId}/print?termId=${termId}`
    );
  };

  const handleOpenBatchPrint = (classId: string, termId: string) => {
    router.push(
      `/dashboard/admin/reports/batch?classId=${classId}&termId=${termId}`
    );
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Reports</h2>
          <p className="text-sm text-gray-600 mt-1">
            Print individual report cards, class result sheets, or batch
            print multiple students at once.
          </p>
        </div>
        <Link
          href="/dashboard/admin"
          className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Link>
      </div>

      {/* Class / Term selectors + inline actions */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-gray-600">Loading classes and terms...</p>
        </div>
      ) : !data || data.classes.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-600 mb-2">No classes available yet.</p>
            <p className="text-sm text-gray-500">
              Create at least one class before printing report cards.
            </p>
            <Button
              className="mt-4"
              onClick={() => router.push("/dashboard/admin/classes")}
            >
              Go to Classes
            </Button>
          </CardContent>
        </Card>
      ) : (
        <PrintControls
          onPrintIndividual={handlePrintIndividual}
          onPrintClassResult={handlePrintClassResult}
          onPrintBatch={handleOpenBatchPrint}
          onSelectionChange={handleSelectionChange}
          initialClassId={initialClassId}
          initialTermId={initialTermId}
        />
      )}

      {/* Descriptive cards */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Individual Report Card
            </CardTitle>
            <FileText className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <CardDescription>
              Print a single student&apos;s report card with all subjects,
              grades, and remarks.
            </CardDescription>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Class Result Sheet
            </CardTitle>
            <Table className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <CardDescription>
              Print a summary sheet with all students in a class and their
              results.
            </CardDescription>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Batch Print</CardTitle>
            <Users className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <CardDescription>
              Select multiple students and print all their report cards at
              once.
            </CardDescription>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function ReportsHubPage() {
  return (
    <Suspense
      fallback={
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      }
    >
      <ReportsHubContent />
    </Suspense>
  );
}
