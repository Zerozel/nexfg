"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrendingUp, AlertTriangle, Lock } from "lucide-react";
import { useAdminAnalytics } from "@/hooks/useAdminAnalytics";

export function SchoolPulseCards() {
  const router = useRouter();
  const { data, isLoading, error } = useAdminAnalytics();
  const [activeTab, setActiveTab] = useState<
    "subjects" | "classes" | "at_risk"
  >("at_risk");

  // Locked (free/trial) state
  if (!isLoading && data?.locked) {
    return (
      <Card className="border-amber-200 bg-gradient-to-br from-amber-50 to-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5 text-amber-600" />
            School Pulse — Advanced Analytics
          </CardTitle>
          <CardDescription>
            Unlock subject performance, class comparisons, and at-risk student
            detection.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => router.push("/dashboard/admin/billing")}>
            Upgrade Plan
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-sm text-gray-500">
          Loading analytics…
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-red-200">
        <CardContent className="py-6 text-sm text-red-600">
          Failed to load analytics: {error}
        </CardContent>
      </Card>
    );
  }

  // No current term
  if (!data?.term) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">School Pulse</CardTitle>
          <CardDescription>
            {data?.reason ||
              "Set a current term to start seeing analytics."}
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const subjects = data.subject_performance || [];
  const classes = data.class_performance || [];
  const atRisk = data.at_risk_students || [];
  const passMark = data.pass_mark ?? 40;

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              School Pulse
            </CardTitle>
            <CardDescription>
              {data.term.name} — pass mark {passMark}%
            </CardDescription>
          </div>
          <div className="flex gap-1 text-xs">
            <button
              onClick={() => setActiveTab("at_risk")}
              className={`px-3 py-1.5 rounded-md transition ${
                activeTab === "at_risk"
                  ? "bg-primary text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              At-Risk ({atRisk.length})
            </button>
            <button
              onClick={() => setActiveTab("subjects")}
              className={`px-3 py-1.5 rounded-md transition ${
                activeTab === "subjects"
                  ? "bg-primary text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              Subjects
            </button>
            <button
              onClick={() => setActiveTab("classes")}
              className={`px-3 py-1.5 rounded-md transition ${
                activeTab === "classes"
                  ? "bg-primary text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              Classes
            </button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* AT-RISK TAB */}
        {activeTab === "at_risk" && (
          <div>
            {atRisk.length === 0 ? (
              <div className="text-center py-6 text-sm text-gray-500">
                No students flagged. Every student is passing at least two
                subjects.
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-xs text-gray-500 mb-3">
                  Students failing {passMark}% or below in 2 or more subjects
                  this term. Ordered by most critical.
                </p>
                {atRisk.map((s) => (
                  <div
                    key={s.student_id}
                    className="flex items-center justify-between border rounded-lg p-3 hover:bg-gray-50"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="h-3.5 w-3.5 text-red-500 flex-shrink-0" />
                        <span className="font-medium text-sm truncate">
                          {s.full_name}
                        </span>
                        {s.admission_number && (
                          <span className="text-xs text-gray-400">
                            {s.admission_number}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5 truncate">
                        {s.failing_subjects.join(", ")}
                        {s.failing_count > 5 &&
                          ` +${s.failing_count - 5} more`}
                      </p>
                    </div>
                    <Badge
                      variant="outline"
                      className="bg-red-50 text-red-700 border-red-200 flex-shrink-0"
                    >
                      {s.failing_count} failing
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* SUBJECTS TAB */}
        {activeTab === "subjects" && (
          <div className="space-y-3">
            {subjects.length === 0 ? (
              <div className="text-center py-6 text-sm text-gray-500">
                No compiled results yet for {data.term.name}.
              </div>
            ) : (
              subjects.map((s) => (
                <div key={s.name} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{s.name}</span>
                    <span className="text-gray-500">
                      Avg {s.average}% · {s.below_pass} below
                    </span>
                  </div>
                  <div className="flex h-2 rounded-full bg-gray-100 overflow-hidden">
                    <div
                      className={`h-full ${
                        s.average >= 60
                          ? "bg-green-500"
                          : s.average >= 40
                          ? "bg-amber-500"
                          : "bg-red-500"
                      }`}
                      style={{ width: `${Math.min(s.average, 100)}%` }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* CLASSES TAB */}
        {activeTab === "classes" && (
          <div className="space-y-3">
            {classes.length === 0 ? (
              <div className="text-center py-6 text-sm text-gray-500">
                No compiled results yet for {data.term.name}.
              </div>
            ) : (
              classes.map((c) => (
                <div key={c.name} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{c.name}</span>
                    <span className="text-gray-500">Avg {c.average}%</span>
                  </div>
                  <div className="flex h-2 rounded-full bg-gray-100 overflow-hidden">
                    <div
                      className={`h-full ${
                        c.average >= 60
                          ? "bg-green-500"
                          : c.average >= 40
                          ? "bg-amber-500"
                          : "bg-red-500"
                      }`}
                      style={{ width: `${Math.min(c.average, 100)}%` }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
