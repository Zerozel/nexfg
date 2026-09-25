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
    arm_teachers?: Record<string, string | null>;
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
  const armTeachers = data.arm_teachers ?? {};
  const armLetters = 'ABCDEFGHIJ'.split('').slice(0, armsCount);

  const baseName = (data.name || '').trim();
  const previewNames =
    armsCount > 1 && baseName
      ? armLetters.map((l) => `${baseName}${l}`)
      : baseName
      ? [baseName]
      : [];

  const setArmTeacher = (letter: string, teacherId: string | null) => {
    onChange('arm_teachers', { ...armTeachers, [letter]: teacherId });
  };

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
          Do not include arm letters (A, B, C). Arms are generated below.
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

      {/* Per-arm teacher selectors */}
      {previewNames.length > 0 && (
        <div className="space-y-3 pt-2 border-t">
          <Label>Class Teachers per Arm</Label>
          {previewNames.map((armName, idx) => {
            const letter = armLetters[idx];
            return (
              <div key={letter} className="flex items-center gap-3">
                <span className="w-24 text-sm font-medium text-gray-700 shrink-0">
                  {armName}
                </span>
                <Select
                  value={armTeachers[letter] || 'none'}
                  onValueChange={(value) =>
                    setArmTeacher(letter, value === 'none' ? null : value)
                  }
                >
                  <SelectTrigger className="flex-1">
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
            );
          })}
        </div>
      )}
    </div>
  );
}
