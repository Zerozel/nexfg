'use client';

import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';

interface TeacherAssignmentFormProps {
  classes: { id: string; name: string }[];
  unassignedSubjects: { id: string; name: string; code: string }[];
  teachers: { id: string; full_name: string }[];
  selectedClassId: string;
  selectedSubjectId: string;
  selectedTeacherId: string;
  onClassChange: (classId: string) => void;
  onSubjectChange: (subjectId: string) => void;
  onTeacherChange: (teacherId: string) => void;
  onSubmit: () => Promise<void>;
  isLoading?: boolean;
}

export function TeacherAssignmentForm({
  classes,
  unassignedSubjects,
  teachers,
  selectedClassId,
  selectedSubjectId,
  selectedTeacherId,
  onClassChange,
  onSubjectChange,
  onTeacherChange,
  onSubmit,
  isLoading = false,
}: TeacherAssignmentFormProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Class *</Label>
        <Select value={selectedClassId} onValueChange={onClassChange}>
          <SelectTrigger>
            <SelectValue placeholder="Select class" />
          </SelectTrigger>
          <SelectContent>
            {classes.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Subject *</Label>
        <Select
          value={selectedSubjectId}
          onValueChange={onSubjectChange}
          disabled={!selectedClassId}
        >
          <SelectTrigger>
            <SelectValue
              placeholder={
                selectedClassId
                  ? 'Select subject'
                  : 'Select a class first'
              }
            />
          </SelectTrigger>
          <SelectContent>
            {unassignedSubjects.map((s) => (
              <SelectItem key={s.id} value={s.id}>
                {s.name} ({s.code})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {selectedClassId && unassignedSubjects.length === 0 && (
          <p className="text-xs text-muted-foreground">
            All subjects have been assigned to this class.
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label>Teacher *</Label>
        <Select value={selectedTeacherId} onValueChange={onTeacherChange}>
          <SelectTrigger>
            <SelectValue placeholder="Select teacher" />
          </SelectTrigger>
          <SelectContent>
            {teachers.map((t) => (
              <SelectItem key={t.id} value={t.id}>
                {t.full_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Button
        onClick={onSubmit}
        disabled={!selectedClassId || !selectedSubjectId || !selectedTeacherId || isLoading}
        className="w-full"
      >
        Assign Teacher
      </Button>
    </div>
  );
}
