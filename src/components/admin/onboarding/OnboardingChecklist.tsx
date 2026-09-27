"use client";

import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Check, Circle, Zap } from "lucide-react";
import { useOnboarding } from "@/hooks/useOnboarding";

interface StepMeta {
  key: string;
  label: string;
  description: string;
  href: string;
}

const STEP_META: StepMeta[] = [
  {
    key: "classes",
    label: "Create your classes",
    description: "e.g., JSS1, JSS2, JSS3",
    href: "/dashboard/admin/classes",
  },
  {
    key: "subjects",
    label: "Add subjects",
    description: "e.g., Mathematics, English, Science",
    href: "/dashboard/admin/subjects",
  },
  {
    key: "class_subjects",
    label: "Assign subjects to classes",
    description: "Click 'Manage Subjects' on any class",
    href: "/dashboard/admin/classes",
  },
  {
    key: "teachers",
    label: "Add teachers",
    description: "At least one teacher account",
    href: "/dashboard/admin/teachers",
  },
  {
    key: "students",
    label: "Add students",
    description: "Enroll your first student",
    href: "/dashboard/admin/students",
  },
];

export function OnboardingChecklist() {
  const { data, isLoading } = useOnboarding();

  // Hide when loading or once complete
  if (isLoading || !data || data.complete) return null;

  const nextStepIndex = STEP_META.findIndex(
    (s) => !data.steps[s.key]?.done
  );
  const nextStep = nextStepIndex >= 0 ? STEP_META[nextStepIndex] : null;

  return (
    <Card className="border-amber-200 bg-gradient-to-br from-amber-50 to-white">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-md bg-amber-100 flex items-center justify-center">
            <Zap className="h-4 w-4 text-amber-700" />
          </div>
          <div>
            <CardTitle className="text-base">Complete Your Setup</CardTitle>
            <CardDescription className="text-xs">
              {data.done_steps} of {data.total_steps} steps done
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Progress bar */}
        <div className="h-1.5 rounded-full bg-amber-100 overflow-hidden">
          <div
            className="h-full bg-amber-500 transition-all duration-500"
            style={{ width: `${data.percent}%` }}
          />
        </div>

        {/* Steps */}
        <div className="space-y-2">
          {STEP_META.map((meta, i) => {
            const step = data.steps[meta.key];
            const isDone = step?.done;
            const isNext = i === nextStepIndex;

            return (
              <Link
                key={meta.key}
                href={meta.href}
                className={`flex items-start gap-3 p-3 rounded-lg transition-colors ${
                  isNext
                    ? "bg-amber-100/60 hover:bg-amber-100"
                    : "hover:bg-gray-50"
                }`}
              >
                <div className="flex-shrink-0 mt-0.5">
                  {isDone ? (
                    <div className="h-5 w-5 rounded-full bg-green-500 flex items-center justify-center">
                      <Check className="h-3 w-3 text-white" strokeWidth={3} />
                    </div>
                  ) : (
                    <Circle
                      className={`h-5 w-5 ${
                        isNext ? "text-amber-600" : "text-gray-300"
                      }`}
                    />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div
                    className={`text-sm font-medium ${
                      isDone
                        ? "text-gray-500 line-through"
                        : "text-gray-900"
                    }`}
                  >
                    {meta.label}
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5">
                    {meta.description}
                    {step?.required !== undefined &&
                      step.required > 0 &&
                      !isDone && (
                        <span className="ml-1 text-amber-700 font-medium">
                          · {step.count}/{step.required}
                        </span>
                      )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* CTA — plain Link styled as a button, since our Button component
            doesn't support asChild */}
        {nextStep && (
          <Link
            href={nextStep.href}
            className="inline-flex items-center justify-center w-full rounded-md bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-4 py-2 text-sm font-medium transition-colors"
          >
            Continue Setup
          </Link>
        )}
      </CardContent>
    </Card>
  );
}
