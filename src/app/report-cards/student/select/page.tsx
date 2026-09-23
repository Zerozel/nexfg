import { redirect } from "next/navigation";

export default function LegacyStudentSelectRedirect() {
  redirect("/dashboard/admin/reports/student/select");
}
