import React from "react";
import { IndividualReportCardData } from "@/types/printing";
import { ClassicNigerianDocument } from "./templates/classic_nigerian";

export function getReportCardComponent(
  templateName: string | null | undefined,
  data: IndividualReportCardData
): React.ReactElement {
  const template = templateName || "classic_nigerian";

  switch (template) {
    case "classic_nigerian":
    default:
      return React.createElement(ClassicNigerianDocument, { data });
  }
}
