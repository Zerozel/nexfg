// components/dashboard/Sidebar.tsx
"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { getSectionsForRole, type SidebarSection } from "@/config/roles";
import { useCurrentSchoolName } from "@/hooks/useCurrentSchoolName";
import { useSubscription } from "@/hooks/useSubscription";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Menu, ChevronLeft, ChevronDown } from "lucide-react";

const STORAGE_KEY = "nexa-sidebar-open-groups";

function loadOpenGroups(): Record<string, boolean> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveOpenGroups(state: Record<string, boolean>) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* ignore */
  }
}

export function Sidebar() {
  const { role } = useAuth();
  const pathname = usePathname();
  const schoolName = useCurrentSchoolName();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const { status: subscription } = useSubscription();

  const studentsUsed = subscription?.usage?.students ?? 0;
  const studentsCap = subscription?.limits?.students;
  const studentsCapKnown =
    typeof studentsCap === "number" && Number.isFinite(studentsCap);
  const studentsCapUnlimited = studentsCap === Infinity || !studentsCapKnown;
  const studentsAtCap =
    studentsCapKnown && studentsUsed >= (studentsCap as number);
  const studentsNearCap =
    studentsCapKnown &&
    (studentsUsed / (studentsCap as number)) >= 0.8 &&
    !studentsAtCap;

  // Group expansion state, persisted per-browser.
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setOpenGroups(loadOpenGroups());
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const sections: SidebarSection[] = useMemo(() => {
    if (!role) return [];
    return getSectionsForRole(role);
  }, [role]);

  useEffect(() => {
    if (!pathname) return;
    let changed = false;
    const next = { ...openGroups };
    for (const section of sections) {
      if (section.type === "group") {
        const hasActive = section.group.items.some(
          (item) =>
            pathname === item.href ||
            (item.href !== "/" && pathname.startsWith(item.href + "/"))
        );
        if (hasActive && !next[section.group.label]) {
          next[section.group.label] = true;
          changed = true;
        }
      }
    }
    if (changed) {
      setOpenGroups(next);
      saveOpenGroups(next);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, sections]);

  const toggleGroup = (label: string) => {
    setOpenGroups((prev) => {
      const next = { ...prev, [label]: !prev[label] };
      saveOpenGroups(next);
      return next;
    });
  };

  const isLinkActive = (href: string) =>
    pathname === href ||
    (href !== "/" && pathname.startsWith(href + "/"));

  if (!role) return null;

  // Capacity badge — rendered only on the Students item
  const renderCapacityBadge = () => {
    if (studentsCapUnlimited) return null;
    const cap = studentsCap as number;
    const label = `${studentsUsed}/${cap}`;
    return (
      <span
        className={cn(
          "ml-auto text-[10px] font-medium px-1.5 py-0.5 rounded",
          studentsAtCap
            ? "bg-red-100 text-red-700"
            : studentsNearCap
              ? "bg-amber-100 text-amber-700"
              : "bg-gray-100 text-gray-600"
        )}
      >
        {label}
      </span>
    );
  };

  const renderNav = (isMobile = false) => (
    <nav className="flex-1 py-3 px-2 overflow-y-auto">
      {sections.map((section, idx) => {
        if (section.type === "item") {
          const { item } = section;
          const Icon = item.icon;
          const isActive = isLinkActive(item.href);
          const isStudentsItem =
            item.href === "/dashboard/admin/students";
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => isMobile && setMobileOpen(false)}
              className={cn(
                "flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors mb-0.5",
                isActive
                  ? "bg-green-50 text-green-700"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
                collapsed && !isMobile && "justify-center px-2"
              )}
              title={collapsed && !isMobile ? item.label : undefined}
            >
              {collapsed && !isMobile ? (
                <Icon className="h-5 w-5" />
              ) : (
                <div className="flex items-center gap-3 min-w-0 w-full">
                  <Icon className="h-4 w-4 shrink-0" />
                  <span className="truncate">{item.label}</span>
                  {isStudentsItem && renderCapacityBadge()}
                </div>
              )}
            </Link>
          );
        }

        const { group } = section;
        const GroupIcon = group.icon;
        const isOpen = !!openGroups[group.label];
        const hasActiveChild = group.items.some((it) =>
          isLinkActive(it.href)
        );

        if (collapsed && !isMobile) {
          return (
            <div
              key={group.label}
              className="mt-2 pt-2 border-t border-gray-100"
            >
              <div className="flex justify-center px-2 py-1 mb-1">
                <GroupIcon className="h-3.5 w-3.5 text-gray-400" />
              </div>
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = isLinkActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    title={item.label}
                    className={cn(
                      "flex items-center justify-center rounded-md px-2 py-2 text-sm transition-colors mb-0.5",
                      isActive
                        ? "bg-green-50 text-green-700"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    )}
                  >
                    <Icon className="h-5 w-5" />
                  </Link>
                );
              })}
            </div>
          );
        }

        return (
          <div
            key={group.label}
            className={cn(
              "mt-2",
              idx > 0 && "pt-2 border-t border-gray-100"
            )}
          >
            <button
              type="button"
              onClick={() => toggleGroup(group.label)}
              className={cn(
                "flex items-center w-full gap-2 px-3 py-1.5 rounded-md text-xs font-semibold uppercase tracking-wide transition-colors",
                hasActiveChild
                  ? "text-green-700"
                  : "text-gray-500 hover:text-gray-800"
              )}
            >
              <ChevronDown
                className={cn(
                  "h-3.5 w-3.5 shrink-0 transition-transform",
                  !isOpen && "-rotate-90"
                )}
              />
              <span className="truncate">{group.label}</span>
            </button>

            {isOpen && (
              <div className="mt-0.5 ml-2 pl-2 border-l border-gray-100 space-y-0.5">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = isLinkActive(item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => isMobile && setMobileOpen(false)}
                      className={cn(
                        "flex items-center gap-3 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                        isActive
                          ? "bg-green-50 text-green-700"
                          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                      )}
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      <span className="truncate">{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </nav>
  );

  const sidebarContent = (
    <div
      className={cn(
        "flex flex-col h-full bg-white border-r border-gray-200 transition-all duration-300",
        collapsed ? "w-16" : "w-60"
      )}
    >
      <div
        className={cn(
          "flex items-center h-16 px-4 border-b border-gray-100 gap-2",
          collapsed ? "justify-center" : "justify-between"
        )}
      >
        {!collapsed && (
          <div className="min-w-0">
            <span
              className="block text-sm font-bold text-gray-900 truncate"
              title={schoolName || "NexaForges"}
            >
              {schoolName || "NexaForges"}
            </span>
            <span className="block text-xs text-amber-500 font-medium">
              NexaForges SMIS
            </span>
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className="h-8 w-8 shrink-0"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <ChevronLeft
            className={cn(
              "h-4 w-4 transition-transform",
              collapsed && "rotate-180"
            )}
          />
        </Button>
      </div>

      {renderNav(false)}

      {!collapsed && (
        <div className="p-4 border-t border-gray-100">
          <p className="text-xs text-gray-400">NexaForges v1.0</p>
        </div>
      )}
    </div>
  );

  return (
    <>
      <aside className="hidden md:block">{sidebarContent}</aside>

      <div className="md:hidden fixed top-4 left-4 z-50">
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="shadow-md">
              <Menu className="h-4 w-4" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-64 flex flex-col">
            <SheetHeader className="p-4 border-b">
              <SheetTitle className="text-sm font-bold text-gray-900 truncate">
                {schoolName || "NexaForges"}
              </SheetTitle>
            </SheetHeader>
            {renderNav(true)}
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}
