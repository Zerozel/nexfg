'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useAdminClasses } from '@/hooks/useClasses';
import { SubjectSelection } from '@/components/subjects/SubjectSelection';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft } from 'lucide-react';

export default function AdminClassSubjectsPage() {
  const params = useParams();
  const classId = params.classId as string;

  const { data: classesData, isLoading } = useAdminClasses({ pageSize: 100 });
  const selectedClass = classesData?.data?.find((c: any) => c.id === classId);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!selectedClass) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Class not found.</p>
        <Link href="/dashboard/admin/classes" className="mt-4 inline-block">
          <Button variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Classes
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/dashboard/admin/classes"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-gray-900 mb-2"
        >
          <ArrowLeft className="mr-1 h-3.5 w-3.5" />
          Back to Classes
        </Link>
      </div>

      <SubjectSelection
        classId={classId}
        className={selectedClass.name}
        apiBase="/api/admin"
      />
    </div>
  );
}
