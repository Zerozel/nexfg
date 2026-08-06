'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface ClassFormProps {
  data: {
    name?: string;
    academic_year_id?: string;
    teacher_id?: string | null;
  };
  onChange: (field: string, value: any) => void;
  academicYears?: { id: string; name: string }[];
  teachers?: { id: string; full_name: string }[];
}

export function ClassForm({
  data,
  onChange,
  academicYears = [],
  teachers = [],
}: ClassFormProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Class Name *</Label>
        <Input
          id="name"
          value={data.name || ''}
          onChange={(e) => onChange('name', e.target.value)}
          placeholder="e.g., Grade 1A, JSS 2B"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="academic_year_id">Academic Year *</Label>
        <Select
          value={data.academic_year_id || ''}
          onValueChange={(value) => onChange('academic_year_id', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select academic year" />
          </SelectTrigger>
          <SelectContent>
            {academicYears.map((ay) => (
              <SelectItem key={ay.id} value={ay.id}>
                {ay.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="teacher_id">Class Teacher</Label>
        <Select
          value={data.teacher_id || ''}
          onValueChange={(value) => onChange('teacher_id', value || null)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select class teacher" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">No teacher</SelectItem>
            {teachers.map((t) => (
              <SelectItem key={t.id} value={t.id}>
                {t.full_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
