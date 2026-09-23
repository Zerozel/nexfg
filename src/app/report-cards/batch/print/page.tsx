import { redirect } from "next/navigation";

export default function LegacyBatchPrintRedirect() {
  redirect("/dashboard/admin/reports/batch/print");
}
