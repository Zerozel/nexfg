// src/app/(dashboard)/dashboard/admin/reports/page.tsx
//
// Hub page for the Reports / Report Cards section.
// Shows class/term selectors + three action buttons (via PrintControls) and
// three descriptive cards for the individual / class / batch print flows.

"use client";

import { useRouter } from "next/navigation";
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

export default function ReportsHubPage() {
  const router = useRouter();
  const { data, isLoading } = useClassesDropdownContext();

  // Handlers mirror what PrintControls passes upward.
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
    // Hub-level Batch button routes to the batch page, which opens its own modal.
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
            <Button className="mt-4" onClick={() => router.push("/dashboard/admin/classes")}>
				Go to Classes
			</Button>
          </CardContent>
        </Card>
      ) : (
        <PrintControls
          onPrintIndividual={handlePrintIndividual}
          onPrintClassResult={handlePrintClassResult}
          onPrintBatch={handleOpenBatchPrint}
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
