import React from "react";
import { IndividualReportCardData } from "@/types/printing";
import {
  ClassicNigerianPage,
  ClassicNigerianBatchDocument,
} from "./templates/classic_nigerian";

/**
 * Returns a single Page component for the given report card template.
 * Wrapped in a Document by the caller.
 */
export function getReportCardComponent(
  templateName: string | null | undefined,
  data: IndividualReportCardData
): React.ReactElement {
  const template = templateName || "classic_nigerian";

  switch (template) {
    case "classic_nigerian":
    default:
      return React.createElement(ClassicNigerianPage, { data });
  }
}

/**
 * Returns a batch Document component for the given report card template.
 */
export function getReportCardBatchComponent(
  templateName: string | null | undefined,
  students: IndividualReportCardData[]
): React.ReactElement {
  const template = templateName || "classic_nigerian";

  switch (template) {
    case "classic_nigerian":
    default:
      return React.createElement(ClassicNigerianBatchDocument, { students });
  }
}
