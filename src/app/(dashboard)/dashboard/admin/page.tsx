"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Users, GraduationCap, BookOpen } from "lucide-react";
import { useAdminStats } from "@/hooks/useAdminStats";

export default function AdminDashboardPage() {
  const { data, isLoading, error } = useAdminStats();

  const display = (value: number | undefined) => {
    if (isLoading) return "…";
    if (error || value === undefined) return "—";
    return value.toLocaleString();
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        Admin Dashboard
      </h2>
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Students</CardTitle>
            <GraduationCap className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {display(data?.students)}
            </div>
            <p className="text-xs text-gray-500">Manage student records</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Teachers</CardTitle>
            <Users className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {display(data?.teachers)}
            </div>
            <p className="text-xs text-gray-500">Manage teacher accounts</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Classes</CardTitle>
            <BookOpen className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {display(data?.classes)}
            </div>
            <p className="text-xs text-gray-500">
              Manage classes & subjects
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
