"use client";

import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useClassStudents } from "@/hooks/useStudents";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Printer, Search } from "lucide-react";

function StudentSelect() {
  const searchParams = useSearchParams();
  const classId = searchParams.get("classId") || "";
  const termId = searchParams.get("termId") || "";

  const { data: students, loading, error } = useClassStudents(classId);
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return students;
    return students.filter(
      (s) =>
        s.full_name.toLowerCase().includes(q) ||
        (s.admission_number || "").toLowerCase().includes(q)
    );
  }, [students, query]);

  const buildPrintHref = (studentId: string) =>
    `/report-cards/student/${studentId}/print?termId=${encodeURIComponent(
      termId
    )}&classId=${encodeURIComponent(classId)}`;

  if (!classId || !termId) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-red-500 text-lg mb-4">
            ⚠️ Missing class or term. Please start from the print page.
          </div>
          <Link
            href="/report-cards/batch"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Print Report Cards
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-3xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Select a Student</h1>
          <p className="text-gray-600 mt-1">
            Choose a student to print their individual report card.
          </p>
        </div>
        <Link
          href="/report-cards/batch"
          className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Link>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search by name or admission number..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* States */}
      {loading && (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-gray-600">Loading students...</p>
        </div>
      )}

      {error && !loading && (
        <div className="text-center py-12 text-red-500">⚠️ {error}</div>
      )}

      {!loading && !error && filtered.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          No students found in this class.
        </div>
      )}

      {/* Student list */}
      {!loading && !error && filtered.length > 0 && (
        <div className="border rounded-lg divide-y">
          {filtered.map((student) => (
            <div
              key={student.id}
              className="flex items-center justify-between p-4 hover:bg-accent/50 transition-colors"
            >
              <div>
                <div className="font-medium">{student.full_name}</div>
                {student.admission_number && (
                  <div className="text-sm text-gray-500">
                    {student.admission_number}
                  </div>
                )}
              </div>
              <Link href={buildPrintHref(student.id)}>
                <Button size="sm">
                  <Printer className="mr-2 h-4 w-4" />
                  Print
                </Button>
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function StudentSelectPage() {
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
      <StudentSelect />
    </Suspense>
  );
}
