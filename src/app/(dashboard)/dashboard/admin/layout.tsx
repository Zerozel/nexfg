import { AuthGuard } from "@/components/auth/AuthGuard";

export default function AdminLayout({ children }) {
  return <AuthGuard allowedRoles={["admin", "principal"]}>{children}</AuthGuard>;
}
