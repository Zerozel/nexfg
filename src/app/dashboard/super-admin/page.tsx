'use client';

import { useSuperAdminStats } from '@/hooks/useSuperAdminStats';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, School, CheckCircle, Clock, Users, UserCheck, BookOpen, BookMarked } from 'lucide-react';

export default function SuperAdminDashboard() {
  const { data: stats, isLoading } = useSuperAdminStats();

  if (isLoading) {
    return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  const cards = [
    { label: 'Schools', value: stats?.total_schools, icon: School, color: 'text-blue-600' },
    { label: 'Active', value: stats?.active_schools, icon: CheckCircle, color: 'text-green-600' },
    { label: 'Trial', value: stats?.trial_schools, icon: Clock, color: 'text-yellow-600' },
    { label: 'Students', value: stats?.total_students, icon: Users, color: 'text-purple-600' },
    { label: 'Teachers', value: stats?.total_teachers, icon: UserCheck, color: 'text-indigo-600' },
    { label: 'Classes', value: stats?.total_classes, icon: BookOpen, color: 'text-orange-600' },
    { label: 'Subjects', value: stats?.total_subjects, icon: BookMarked, color: 'text-pink-600' },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">NexaForges System Admin</h1>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {cards.map((card) => (
          <Card key={card.label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{card.label}</CardTitle>
              <card.icon className={`h-5 w-5 ${card.color}`} />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{card.value?.toLocaleString() || 0}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
