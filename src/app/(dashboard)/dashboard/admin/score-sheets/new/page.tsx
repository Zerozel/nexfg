"use client";

import { BatchCreator } from "@/components/score-sheets/BatchCreator";

export default function NewScoreSheetPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          New Score Sheet
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Choose a class, subject, and term. Print the sheet for the teacher.
        </p>
      </div>
      <BatchCreator />
    </div>
  );
}
