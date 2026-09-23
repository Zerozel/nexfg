import { redirect } from "next/navigation";

export default function LegacyBatchRedirect() {
  redirect("/dashboard/admin/reports/batch");
}
