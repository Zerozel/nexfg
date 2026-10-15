"use client";

import Link from "next/link";
import { Plus, Loader2, FileText, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useScoreSheetBatches } from "@/hooks/useScoreSheets";

const STATUS_STYLES: Record<string, string> = {
  created: "bg-gray-100 text-gray-700",
  uploaded: "bg-amber-100 text-amber-700",
  reviewed: "bg-blue-100 text-blue-700",
  confirmed: "bg-green-100 text-green-700",
  discarded: "bg-gray-100 text-gray-400",
};

export default function ScoreSheetsPage() {
  const { data, isLoading, error, upgradeRequired } = useScoreSheetBatches();

  if (upgradeRequired) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Score Sheets</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Print a sheet, have teachers fill scores by hand, then upload the
            filled sheet to extract scores automatically.
          </p>
        </div>
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center">
                <Lock className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <CardTitle>Paid plan required</CardTitle>
                <CardDescription className="mt-1">
                  Score Sheets are available on Starter and Growth plans.
                  Upgrade to use this feature.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Link href="/dashboard/admin/billing">
              <Button>Upgrade plan</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Score Sheets</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Print a sheet, have teachers fill scores by hand, then upload the
            filled sheet to extract scores automatically.
          </p>
        </div>
        <Link href="/dashboard/admin/score-sheets/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Score Sheet
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
        </div>
      ) : error ? (
        <div className="text-center py-16 text-red-600 text-sm">{error}</div>
      ) : data.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <FileText className="h-10 w-10 mx-auto mb-3 text-gray-300" />
            <p className="text-sm text-gray-500 mb-4">
              No score sheets yet. Create one to get started.
            </p>
            <Link href="/dashboard/admin/score-sheets/new">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                New Score Sheet
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {data.map((b) => (
            <Link
              key={b.id}
              href={`/dashboard/admin/score-sheets/${b.id}`}
              className="block border rounded-lg p-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="font-medium truncate">
                    {b.class_name} · {b.subject_name}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {b.term_name}
                    {b.academic_session && ` — ${b.academic_session}`}
                    {b.teacher_name && ` · ${b.teacher_name}`}
                    {` · ${new Date(b.created_at).toLocaleDateString()}`}
                  </div>
                </div>
                <Badge
                  className={STATUS_STYLES[b.status] || STATUS_STYLES.created}
                >
                  {b.status}
                </Badge>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
