'use client';

import { useState, useEffect } from 'react';
import { useFormClassSubjects } from '@/hooks/useFormClassSubjects';
import { useSchoolTeachers } from '@/hooks/useSchoolTeachers';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { X, UserPlus } from 'lucide-react';

interface SubjectSelectionProps {
  classId: string;
  className: string;
}

export function SubjectSelection({ classId, className }: SubjectSelectionProps) {
  const { activeSubjects, availableSubjects, loading, error, refetch } = useFormClassSubjects(classId);
  const { data: teachers, loading: teachersLoading } = useSchoolTeachers();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [selectedTeacherId, setSelectedTeacherId] = useState('');
  const [teacherMap, setTeacherMap] = useState<Record<string, string>>({});
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();

  // Build teacherMap from activeSubjects when they change
  useEffect(() => {
    const map: Record<string, string> = {};
    activeSubjects.forEach((subject) => {
      if (subject.teacher_id) {
        map[subject.id] = subject.teacher_id;
      }
    });
    setTeacherMap(map);
    setSelectedIds(activeSubjects.map((s) => s.id));
  }, [activeSubjects]);

  const allSubjects = [...activeSubjects, ...availableSubjects];

  const handleToggle = (subjectId: string, checked: boolean) => {
    if (checked) {
      setSelectedIds([...selectedIds, subjectId]);
    } else {
      setSelectedIds(selectedIds.filter((id) => id !== subjectId));
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetch('/api/teacher/form-class-subjects', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          class_id: classId,
          subject_ids: selectedIds,
        }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Failed to save');
      }

      toast({
        title: 'Success',
        description: `Subjects updated: ${selectedIds.length} active`,
      });
      refetch();
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message,
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleOpenAssign = (subjectId: string) => {
    setSelectedSubjectId(subjectId);
    setSelectedTeacherId('');
    setDialogOpen(true);
  };

  const handleAssign = async () => {
    if (!selectedSubjectId || !selectedTeacherId) {
      toast({
        title: 'Error',
        description: 'Please select both a subject and a teacher.',
        variant: 'destructive',
      });
      return;
    }

    setIsAssigning(true);
    try {
      const response = await fetch('/api/teacher/assign-subject', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          class_id: classId,
          subject_id: selectedSubjectId,
          teacher_id: selectedTeacherId,
        }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Failed to assign teacher');
      }

      toast({
        title: 'Success',
        description: 'Teacher assigned to subject successfully.',
      });
      setSelectedSubjectId('');
      setSelectedTeacherId('');
      setDialogOpen(false);
      refetch();
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message,
        variant: 'destructive',
      });
    } finally {
      setIsAssigning(false);
    }
  };

  const handleRemove = async (subjectId: string) => {
    try {
      const response = await fetch('/api/teacher/remove-subject', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          class_id: classId,
          subject_id: subjectId,
        }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Failed to remove teacher');
      }

      toast({
        title: 'Success',
        description: 'Teacher removed from subject.',
      });
      refetch();
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message,
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12 border rounded-lg bg-red-50">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">{className}</h2>
        <p className="text-muted-foreground">
          Select subjects and assign Subject Teachers for this class.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Subjects & Subject Teachers</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4">
            {allSubjects.map((subject) => {
              const isActive = selectedIds.includes(subject.id);
              // Use teacher_id directly from the subject object
              const assignedTeacherId = subject.teacher_id || null;
              const teacherName = teachers?.find((t) => t.id === assignedTeacherId)?.full_name || 'Not Assigned';
              const isAssigned = !!assignedTeacherId;

              return (
                <div key={subject.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3 flex-1">
                    <Checkbox
                      id={subject.id}
                      checked={isActive}
                      onCheckedChange={(checked) => handleToggle(subject.id, checked === true)}
                    />
                    <Label htmlFor={subject.id} className="cursor-pointer">
                      <span className="font-medium">{subject.name}</span>
                      <span className="text-sm text-muted-foreground ml-2">
                        {subject.code}
                      </span>
                    </Label>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="text-sm">
                      <span className="text-muted-foreground">Teacher: </span>
                      <span className={isAssigned ? 'font-medium text-green-600' : 'text-gray-400'}>
                        {teacherName}
                      </span>
                    </div>

                    {isActive && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenAssign(subject.id)}
                      >
                        <UserPlus className="h-4 w-4 mr-1" />
                        {isAssigned ? 'Change' : 'Assign'}
                      </Button>
                    )}

                    {isAssigned && isActive && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemove(subject.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between pt-4 border-t">
            <span className="text-sm text-muted-foreground">
              {selectedIds.length} of {allSubjects.length} subjects active
            </span>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Assignment Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Teacher to Subject</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Select value={selectedSubjectId} onValueChange={setSelectedSubjectId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a subject" />
              </SelectTrigger>
              <SelectContent>
                {allSubjects.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedTeacherId} onValueChange={setSelectedTeacherId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a teacher" />
              </SelectTrigger>
              <SelectContent>
                {teachersLoading ? (
                  <SelectItem value="loading" disabled>Loading...</SelectItem>
                ) : (
                  teachers?.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.full_name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            <Button onClick={handleAssign} disabled={isAssigning} className="w-full">
              {isAssigning ? 'Assigning...' : 'Assign Teacher'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}