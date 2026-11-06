// src/lib/pdf/index.ts
import React from "react";
import { Document } from "@react-pdf/renderer";
import type { DocumentProps } from "@react-pdf/renderer";
import type { IndividualReportCardData } from "@/types/printing";
import { getTemplate, listTemplates, TEMPLATE_REGISTRY } from "./templates/registry";

export { listTemplates, TEMPLATE_REGISTRY };

/** Single-page renderer (used by student route, wrapped in a Document by caller). */
export function getReportCardPage(
  templateKey: string | null | undefined,
  data: IndividualReportCardData
): React.ReactElement {
  const meta = getTemplate(templateKey);
  return React.createElement(meta.Component, { data });
}

/** Batch document (used by class route). */
export function getReportCardBatchDocument(
  templateKey: string | null | undefined,
  students: IndividualReportCardData[]
): React.ReactElement<DocumentProps> {
  const meta = getTemplate(templateKey);
  return React.createElement(
    Document,
    null,
    students.map((s, i) =>
      React.createElement(meta.Component, {
        key: s.student?.id || `student-${i}`,
        data: s,
      })
    )
  ) as React.ReactElement<DocumentProps>;
}
