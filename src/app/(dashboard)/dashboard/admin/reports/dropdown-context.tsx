"use client";

import { createContext, useContext } from "react";
import type { ClassesDropdownData } from "@/types/printing";

export interface DropdownContextValue {
  data: ClassesDropdownData | null;
  isLoading: boolean;
  error: string | null;
}

export const DropdownContext = createContext<DropdownContextValue | undefined>(
  undefined
);

export function useClassesDropdownContext(): DropdownContextValue {
  const ctx = useContext(DropdownContext);
  if (!ctx) {
    throw new Error(
      "useClassesDropdownContext must be used inside <ReportsLayout>"
    );
  }
  return ctx;
}
