// src/lib/pdf/templates/registry.ts
import type { IndividualReportCardData } from "@/types/printing";
import type React from "react";

import { ClassicNigerianPage } from "./classic_nigerian";
import { ClassicCompactPage } from "./classic_compact";

export interface TemplateMeta {
  /** Stable key stored in schools.report_card_template */
  key: string;
  /** Human-readable name shown in admin UI */
  name: string;
  /** Short description */
  description: string;
  /** The React-PDF Page component */
  Component: React.ComponentType<{ data: IndividualReportCardData }>;
}

export const TEMPLATE_REGISTRY: Record<string, TemplateMeta> = {
  classic_nigerian: {
    key: "classic_nigerian",
    name: "Classic Nigerian",
    description:
      "Full-width subject table with CA/Exam breakdown, affective traits, psychomotor skills, and remarks. The standard Nigerian secondary school format.",
    Component: ClassicNigerianPage,
  },
  classic_compact: {
    key: "classic_compact",
    name: "Classic Compact",
    description:
      "Two-column subject table for schools with many subjects. Denser layout, same data.",
    Component: ClassicCompactPage,
  },
};

export const DEFAULT_TEMPLATE_KEY = "classic_nigerian";

/** Resolve a template key safely. Falls back to the default. */
export function getTemplate(key: string | null | undefined): TemplateMeta {
  if (key && TEMPLATE_REGISTRY[key]) {
    return TEMPLATE_REGISTRY[key];
  }
  return TEMPLATE_REGISTRY[DEFAULT_TEMPLATE_KEY];
}

/** For admin dropdowns — array of all templates. */
export function listTemplates(): TemplateMeta[] {
  return Object.values(TEMPLATE_REGISTRY);
}
