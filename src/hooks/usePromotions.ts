"use client";

import { useState, useCallback } from "react";

export type PromotionOutcome =
  | "promoted"
  | "repeated"
  | "withdrawn"
  | "transferred"
  | "graduated";

export interface PreviewStudent {
  student_id: string;
  full_name: string;
  admission_number: string | null;
  average: number;
  recommended_outcome: "promoted" | "repeated" | "graduated";
  recommended_to_class_id: string | null;
  recommended_to_class_name: string | null;
}

export interface PreviewClassGroup {
  from_class_id: string;
  from_class_name: string;
  from_class_base_name: string | null;
  target_class_group_name: string | null;
  students: PreviewStudent[];
}

export interface PromotionPreview {
  from_year: { id: string; name: string } | null;
  from_term: { id: string; name: string };
  to_year: { id: string; name: string } | null;
  to_term: { id: string; name: string } | null;
  promotion_threshold: number;
  classes: PreviewClassGroup[];
}

export interface ConfirmResult {
  promoted: number;
  repeated: number;
  withdrawn: number;
  transferred: number;
  graduated: number;
  next_year_id: string;
  next_year_name: string;
  next_term_id: string;
  next_term_name: string;
}

export function usePromotionMutations() {
  const previewPromotions = useCallback(
    async (fromTermId: string): Promise<PromotionPreview> => {
      const response = await fetch("/api/admin/promotions/preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ from_term_id: fromTermId }),
      });
      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || "Failed to preview promotions");
      }
      const result = await response.json();
      return result.data as PromotionPreview;
    },
    []
  );

  const confirmPromotions = useCallback(
    async (
      fromTermId: string,
      students: {
        student_id: string;
        outcome: PromotionOutcome;
        to_class_id: string | null;
        average: number;
      }[]
    ): Promise<ConfirmResult> => {
      const response = await fetch("/api/admin/promotions/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ from_term_id: fromTermId, students }),
      });
      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || "Failed to confirm promotions");
      }
      const result = await response.json();
      return result.data as ConfirmResult;
    },
    []
  );

  return { previewPromotions, confirmPromotions };
}
