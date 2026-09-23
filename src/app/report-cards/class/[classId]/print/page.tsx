import { redirect } from "next/navigation";

export default function LegacyClassPrintRedirect() {
  redirect("/dashboard/admin/reports");
}
