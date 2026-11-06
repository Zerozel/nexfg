// src/lib/pdf/templates/registry.ts
import type { IndividualReportCardData } from "@/types/printing";
import type React from "react";

import { ClassicNigerianPage } from "./classic_nigerian";
import { ClassicCompactPage } from "./classic_compact";
import { HeritageNavyPage } from "./heritage_navy";
import { HeritageBurgundyPage } from "./heritage_burgundy";
import { HeritageSlatePage } from "./heritage_slate";

export interface TemplateMeta {
  key: string;
  name: string;
  description: string;
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
  heritage_navy: {
    key: "heritage_navy",
    name: "Heritage Navy",
    description:
      "Deep navy and gold heritage layout with full CA breakdown, checkbox traits, and dual feedback. Prints cleanly in black and white.",
    Component: HeritageNavyPage,
  },
  heritage_burgundy: {
    key: "heritage_burgundy",
    name: "Heritage Burgundy",
    description:
      "Premium burgundy-and-brass ledger design with a floating identity card, score progress bars, circular grade pills, and tick rubric traits. The flagship template.",
    Component: HeritageBurgundyPage,
  },
  heritage_slate: {
    key: "heritage_slate",
    name: "Heritage Slate",
    description:
      "Modern sidebar layout with dark slate + amber accents. Sidebar carries school and student identity; main panel shows subject tiles in a compact grid. Tick rubric traits and dual feedback.",
    Component: HeritageSlatePage,
  },
};

export const DEFAULT_TEMPLATE_KEY = "classic_nigerian";

export function getTemplate(key: string | null | undefined): TemplateMeta {
  if (key && TEMPLATE_REGISTRY[key]) {
    return TEMPLATE_REGISTRY[key];
  }
  return TEMPLATE_REGISTRY[DEFAULT_TEMPLATE_KEY];
}

export function listTemplates(): TemplateMeta[] {
  return Object.values(TEMPLATE_REGISTRY);
}
