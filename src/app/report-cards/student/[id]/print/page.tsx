import { redirect } from "next/navigation";

export default function LegacyStudentPrintRedirect() {
  redirect("/dashboard/admin/reports");
}
