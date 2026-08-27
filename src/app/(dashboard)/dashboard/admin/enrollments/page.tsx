'use client';

import { useState } from 'react';
import { useEnrollments, useUnenrolledStudents, useEnrollmentMutations } from '@/hooks/useEnrollments';
import { useAdminClasses } from '@/hooks/useClasses';
import { EnrollmentTable } from '@/components/admin/tables/EnrollmentTable';
import { EnrollmentForm } from '@/components/admin/forms/EnrollmentForm';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import { Enrollment } from '@/types/admin';

export default function EnrollmentsPage() {
  const [selectedClassId, setSelectedClassId] = useState('');
  const [selectedTermId, setSelectedTermId] = useState('');
  const [page, setPage] = useState(1);
  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { toast } = useToast();
  const { data: classesData } = useAdminClasses({ pageSize: 100 });
  const { data: enrollmentsData, isLoading, refetch } = useEnrollments({
    classId: selectedClassId,
    termId: selectedTermId,
    page,
  });
  const { data: unenrolledStudents, refetch: refetchUnenrolled } = useUnenrolledStudents(
    selectedClassId,
    selectedTermId
  );
  const { enrollBulk, enrollCsv, unenrollStudent } = useEnrollmentMutations();

  const classes = classesData?.data || [];
  const terms = [
    { id: 'first-term-2024', name: 'First Term 2024' },
    { id: 'second-term-2024', name: 'Second Term 2024' },
  ];

  const handleEnrollMulti = async (studentIds: string[]) => {
    if (!selectedClassId || !selectedTermId) return;
    setIsSubmitting(true);
    try {
      const result = await enrollBulk({
        student_ids: studentIds,
        class_id: selectedClassId,
        term_id: selectedTermId,
      });
      toast({
        title: 'Enrollment Complete',
        description: `${result.enrolled} enrolled, ${result.failed} failed`,
      });
      setShowEnrollModal(false);
      refetch();
      refetchUnenrolled();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEnrollCsv = async (admissionNumbers: string[]) => {
    if (!selectedClassId || !selectedTermId) return;
    setIsSubmitting(true);
    try {
      const result = await enrollCsv({
        admission_numbers: admissionNumbers,
        class_id: selectedClassId,
        term_id: selectedTermId,
      });
      toast({
        title: 'CSV Enrollment Complete',
        description: `${result.enrolled} enrolled, ${result.failed} failed`,
      });
      setShowEnrollModal(false);
      refetch();
      refetchUnenrolled();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUnenroll = async (enrollment: Enrollment) => {
    setIsSubmitting(true);
    try {
      await unenrollStudent(enrollment.student_id, selectedClassId, selectedTermId);
      toast({ title: 'Success', description: 'Student unenrolled successfully' });
      refetch();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Enrollments</h1>
          <p className="text-muted-foreground">
            Manage student enrollments per class and term.
          </p>
        </div>
        <Button
          onClick={() => setShowEnrollModal(true)}
          disabled={!selectedClassId || !selectedTermId}
        >
          Enroll Students
        </Button>
      </div>

      {/* Class & Term Selection */}
      <div className="flex gap-4 p-4 bg-muted rounded-lg">
        <div className="flex-1">
          <label className="text-sm font-medium">Class</label>
          <select
            className="w-full mt-1 rounded-md border px-3 py-2"
            value={selectedClassId}
            onChange={(e) => setSelectedClassId(e.target.value)}
          >
            <option value="">Select a class...</option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex-1">
          <label className="text-sm font-medium">Term</label>
          <select
            className="w-full mt-1 rounded-md border px-3 py-2"
            value={selectedTermId}
            onChange={(e) => setSelectedTermId(e.target.value)}
          >
            <option value="">Select a term...</option>
            {terms.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Enrollment Table */}
      {selectedClassId && selectedTermId ? (
        <>
          <EnrollmentTable
            enrollments={enrollmentsData?.data || []}
            onUnenroll={handleUnenroll}
            isLoading={isLoading}
          />
          {enrollmentsData?.meta && enrollmentsData.meta.total_pages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Showing {((page - 1) * 10) + 1} to {Math.min(page * 10, enrollmentsData.meta.total)} of{' '}
                {enrollmentsData.meta.total} students
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page - 1)}
                  disabled={page <= 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page + 1)}
                  disabled={page >= enrollmentsData.meta.total_pages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-12 text-muted-foreground border rounded-lg">
          Select a class and term to view enrollments
        </div>
      )}

      {/* Enroll Modal */}
      <Dialog open={showEnrollModal} onOpenChange={setShowEnrollModal}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>Enroll Students</DialogTitle>
          </DialogHeader>
          <EnrollmentForm
            classes={classes}
            terms={terms}
            unenrolledStudents={unenrolledStudents}
            selectedClassId={selectedClassId}
            selectedTermId={selectedTermId}
            onClassChange={setSelectedClassId}
            onTermChange={setSelectedTermId}
            onEnrollMulti={handleEnrollMulti}
            onEnrollCsv={handleEnrollCsv}
            isLoading={isSubmitting}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
