// Report Cards route-group layout.
// Imports the print stylesheets so they load for every /report-cards/* route.
// Scoping here (rather than the root layout) keeps print-specific rules
// contained to the printing routes, per Next.js CSS ordering guidance.
import "@/styles/print.css";
import "@/styles/report-card.css";

export default function ReportCardsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
