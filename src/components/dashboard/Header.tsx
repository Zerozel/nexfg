// components/dashboard/Header.tsx
"use client";

import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { ROLE_LABELS } from "@/config/roles";
import { useSubscription } from "@/hooks/useSubscription";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut, AlertTriangle, Clock, Lock } from "lucide-react";

export function Header() {
  const { user, role, signOut } = useAuth();
  const { status, isLoading } = useSubscription();

  const initials = user?.email
    ? user.email.charAt(0).toUpperCase()
    : "U";

  // Only show banners for admin / principal (not super-admin or teacher).
  const showBillingBanner =
    (role === "admin" || role === "principal") && !isLoading && status;

  return (
    <>
      <header className="h-16 border-b border-gray-200 bg-white flex items-center justify-between px-6 md:pl-6 pl-16">
        <div>
          <h1 className="text-sm font-medium text-gray-600">
            {role ? ROLE_LABELS[role] : ""} Dashboard
          </h1>
        </div>

        <div className="flex items-center gap-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="relative h-10 w-10 rounded-full"
              >
                <Avatar className="h-10 w-10 border-2 border-green-100">
                  <AvatarFallback className="bg-green-100 text-green-700 font-medium">
                    {initials}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium">{user?.email}</p>
                  <p className="text-xs text-gray-500">
                    {role ? ROLE_LABELS[role] : ""}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer" onClick={signOut}>
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {showBillingBanner && status.status === "trial" &&
        status.days_until_expiry !== null &&
        status.days_until_expiry > 0 && (
          <div className="bg-amber-50 border-b border-amber-200 px-6 py-2 flex items-center justify-between gap-4 text-sm text-amber-900">
            <div className="flex items-center gap-2 min-w-0">
              <Clock className="h-4 w-4 flex-shrink-0" />
              <span className="truncate">
                Trial ends in{" "}
                <strong>{status.days_until_expiry}</strong>{" "}
                {status.days_until_expiry === 1 ? "day" : "days"}. Upgrade to
                keep full access.
              </span>
            </div>
            <Link
              href="/dashboard/admin/billing"
              className="font-medium underline hover:no-underline flex-shrink-0"
            >
              Upgrade →
            </Link>
          </div>
        )}

      {showBillingBanner && status.status === "expired" && (
        <div className="bg-red-50 border-b border-red-200 px-6 py-2 flex items-center justify-between gap-4 text-sm text-red-900">
          <div className="flex items-center gap-2 min-w-0">
            <AlertTriangle className="h-4 w-4 flex-shrink-0" />
            <span className="truncate">
              Your subscription has expired. You can view data but cannot add
              new records.
            </span>
          </div>
          <Link
            href="/dashboard/admin/billing"
            className="font-medium underline hover:no-underline flex-shrink-0"
          >
            Renew →
          </Link>
        </div>
      )}

      {showBillingBanner && status.status === "inactive" && (
        <div className="bg-red-50 border-b border-red-200 px-6 py-2 flex items-center justify-between gap-4 text-sm text-red-900">
          <div className="flex items-center gap-2 min-w-0">
            <Lock className="h-4 w-4 flex-shrink-0" />
            <span className="truncate">
              Your account is inactive. Contact support to reactivate.
            </span>
          </div>
          <Link
            href="/dashboard/admin/billing"
            className="font-medium underline hover:no-underline flex-shrink-0"
          >
            Billing →
          </Link>
        </div>
      )}
    </>
  );
}
