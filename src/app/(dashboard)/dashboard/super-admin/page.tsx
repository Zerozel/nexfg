'use client';

import Link from 'next/link';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Building2,
  Users,
  GraduationCap,
  BookOpen,
  ClipboardList,
  TrendingUp,
  LoaderCircle,
} from 'lucide-react';
import { useSuperAdminStats } from '@/hooks/useSuperAdminStats';

export default function SuperAdminDashboardPage() {
  const { data: stats, isLoading, error } = useSuperAdminStats();

  const schoolCards = [
    { label: 'Total Schools', value: stats?.total_schools, icon: Building2 },
    { label: 'Active', value: stats?.active_schools, icon: TrendingUp },
    { label: 'Trial', value: stats?.trial_schools, icon: ClipboardList },
    { label: 'Inactive', value: stats?.inactive_schools, icon: Building2 },
  ];

  const platformCards = [
    { label: 'Students', value: stats?.total_students, icon: Users },
    { label: 'Teachers', value: stats?.total_teachers, icon: GraduationCap },
    { label: 'Classes', value: stats?.total_classes, icon: BookOpen },
    { label: 'Subjects', value: stats?.total_subjects, icon: ClipboardList },
  ];

  const renderValue = (value: number | undefined) => {
    if (isLoading) return <LoaderCircle className="h-5 w-5 animate-spin text-muted-foreground" />;
    return <span className="text-2xl font-bold">{value ?? 0}</span>;
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">System Admin Dashboard</h2>
        <Link href="/dashboard/super-admin/schools" className="text-sm font-medium text-primary hover:underline">
          Manage Schools →
        </Link>
      </div>

      {error && (
        <p className="text-sm text-destructive">Failed to load stats: {error}</p>
      )}

      <section className="space-y-3">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Schools</h3>
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
          {schoolCards.map((c) => (
            <Card key={c.label}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{c.label}</CardTitle>
                <c.icon className="h-4 w-4 text-gray-400" />
              </CardHeader>
              <CardContent>{renderValue(c.value)}</CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Platform Totals</h3>
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
          {platformCards.map((c) => (
            <Card key={c.label}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{c.label}</CardTitle>
                <c.icon className="h-4 w-4 text-gray-400" />
              </CardHeader>
              <CardContent>{renderValue(c.value)}</CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
