'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface SubjectFormProps {
  data: {
    name?: string;
    code?: string;
  };
  onChange: (field: string, value: any) => void;
}

export function SubjectForm({ data, onChange }: SubjectFormProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Subject Name *</Label>
        <Input
          id="name"
          value={data.name || ''}
          onChange={(e) => onChange('name', e.target.value)}
          placeholder="e.g., Mathematics, English Language"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="code">Subject Code *</Label>
        <Input
          id="code"
          value={data.code || ''}
          onChange={(e) => onChange('code', e.target.value.toUpperCase())}
          placeholder="e.g., MATH, ENG"
          maxLength={10}
        />
        <p className="text-xs text-muted-foreground">
          Short unique code for this subject (max 10 characters).
        </p>
      </div>
    </div>
  );
}
