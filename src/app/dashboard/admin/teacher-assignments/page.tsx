'use client';

import { useState, useEffect } from 'react';
import {
  useTeacherAssignments,
  useUnassignedSubjects,
  useTeacherAssignmentMutations,
} from '@/hooks/useTeacherAssignments';
import { useAdminClasses } from '@/hooks/useClasses';
import { useTeachers } from '@/hooks/useTeachers';
import { TeacherAssignmentForm } from '@/components/admin/forms/TeacherAssignmentForm';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Trash2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

export default function TeacherAssignmentsPage() {
  const [selectedClassId, setSelectedClassId] = useState('');
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [selectedTeacherId, setSelectedTeacherId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { toast } = useToast();
  const { data: classesData } = useAdminClasses({ pageSize: 100 });
  const { data: teachersData } = useTeachers({ pageSize: 100 });
  const { data: assignments, refetch: refetchAssignments } = useTeacherAssignments(selectedClassId);
  const { data: unassignedSubjects, refetch: refetchSubjects } = useUnassignedSubjects(selectedClassId);
  const { assignTeacher, removeAssignment } = useTeacherAssignmentMutations();

  const classes = classesData?.data || [];
  const teachers = teachersData?.data || [];

  useEffect(() => {
    if (selectedClassId) {
      setSelectedSubjectId('');
      setSelectedTeacherId('');
    }
  }, [selectedClassId]);

  const handleAssign = async () => {
    setIsSubmitting(true);
    try {
      const result = await assignTeacher({
        class_id: selectedClassId,
        subject_id: selectedSubjectId,
        teacher_id: selectedTeacherId,
      });
      toast({ title: 'Success', description: 'Teacher assigned successfully' });
      setSelectedSubjectId('');
      setSelectedTeacherId('');
      refetchAssignments();
      refetchSubjects();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemove = async (id: string) => {
    try {
      await removeAssignment(id);
      toast({ title: 'Success', description: 'Assignment removed' });
      refetchAssignments();
      refetchSubjects();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Teacher Assignments</h1>
        <p className="text-muted-foreground">
          Assign teachers to subjects for each class.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Assignment Form */}
        <div className="border rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">New Assignment</h2>
          <TeacherAssignmentForm
            classes={classes}
            unassignedSubjects={unassignedSubjects}
            teachers={teachers}
            selectedClassId={selectedClassId}
            selectedSubjectId={selectedSubjectId}
            selectedTeacherId={selectedTeacherId}
            onClassChange={setSelectedClassId}
            onSubjectChange={setSelectedSubjectId}
            onTeacherChange={setSelectedTeacherId}
            onSubmit={handleAssign}
            isLoading={isSubmitting}
          />
        </div>

        {/* Assignments List */}
        <div className="border rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">
            Current Assignments
            {selectedClassId && classes.find((c) => c.id === selectedClassId) && (
              <span className="text-muted-foreground font-normal ml-2">
                — {classes.find((c) => c.id === selectedClassId)?.name}
              </span>
            )}
          </h2>

          {!selectedClassId ? (
            <p className="text-muted-foreground text-center py-8">
              Select a class to view assignments
            </p>
          ) : assignments.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No teacher assignments for this class
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Subject</TableHead>
                  <TableHead>Teacher</TableHead>
                  <TableHead className="w-[60px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {assignments.map((assignment) => (
                  <TableRow key={assignment.id}>
                    <TableCell className="font-medium">
                      {assignment.subject_name}
                    </TableCell>
                    <TableCell>{assignment.teacher_name}</TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemove(assignment.id)}
                        className="text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </div>
    </div>
  );
}
