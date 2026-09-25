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
    arms_count?: number;
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
  const armsCount = data.arms_count ?? 1;

  const armsPreview =
    armsCount > 1 && data.name
      ? Array.from({ length: armsCount }, (_, i) =>
          `${data.name}${'ABCDEFGHIJ'[i]}`
        ).join(', ')
      : null;

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Base Class Name *</Label>
        <Input
          id="name"
          value={data.name || ''}
          onChange={(e) => onChange('name', e.target.value)}
          placeholder="e.g., JSS 1"
        />
        <p className="text-xs text-gray-500">
          Do not include arm letters (A, B, C). Arms are generated
          automatically below.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="arms_count">Number of Arms *</Label>
        <Select
          value={String(armsCount)}
          onValueChange={(value) => onChange('arms_count', parseInt(value, 10))}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select arms count" />
          </SelectTrigger>
          <SelectContent>
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <SelectItem key={n} value={String(n)}>
                {n} arm{n > 1 ? 's' : ''}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {armsPreview && (
          <p className="text-xs text-gray-500">
            Will create: <strong>{armsPreview}</strong>
          </p>
        )}
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
          value={data.teacher_id || 'none'}
          onValueChange={(value) =>
            onChange('teacher_id', value === 'none' ? null : value)
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Select class teacher" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">No teacher</SelectItem>
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
