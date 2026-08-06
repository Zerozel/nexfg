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

interface TeacherFormProps {
  data: {
    full_name?: string;
    email?: string;
    role?: 'teacher' | 'admin' | 'principal';
  };
  onChange: (field: string, value: any) => void;
  isEditing?: boolean;
}

export function TeacherForm({ data, onChange, isEditing = false }: TeacherFormProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="full_name">Full Name *</Label>
        <Input
          id="full_name"
          value={data.full_name || ''}
          onChange={(e) => onChange('full_name', e.target.value)}
          placeholder="Enter teacher's full name"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email *</Label>
        <Input
          id="email"
          type="email"
          value={data.email || ''}
          onChange={(e) => onChange('email', e.target.value)}
          placeholder="Enter email address"
          disabled={isEditing}
        />
        {isEditing && (
          <p className="text-xs text-muted-foreground">
            Email cannot be changed after creation.
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="role">Role *</Label>
        <Select
          value={data.role || 'teacher'}
          onValueChange={(value) => onChange('role', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="teacher">Teacher</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="principal">Principal</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
