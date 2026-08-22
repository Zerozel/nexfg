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
import { Student } from '@/types/admin';

interface StudentFormProps {
  data?: Partial<Student>;
  onChange: (field: string, value: any) => void;
  classes?: { id: string; name: string }[];
}

export function StudentForm({ data = {}, onChange, classes = [] }: StudentFormProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="full_name">Full Name *</Label>
        <Input
          id="full_name"
          value={data.full_name || ''}
          onChange={(e) => onChange('full_name', e.target.value)}
          placeholder="Enter student's full name"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="date_of_birth">Date of Birth</Label>
          <Input
            id="date_of_birth"
            type="date"
            value={data.date_of_birth || ''}
            onChange={(e) => onChange('date_of_birth', e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="gender">Gender</Label>
          <Select
            value={data.gender || ''}
            onValueChange={(value) => onChange('gender', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select gender" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="male">Male</SelectItem>
              <SelectItem value="female">Female</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="guardian_name">Guardian Name *</Label>
        <Input
          id="guardian_name"
          value={data.guardian_name || ''}
          onChange={(e) => onChange('guardian_name', e.target.value)}
          placeholder="Enter guardian's full name"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="guardian_phone">Guardian Phone *</Label>
          <Input
            id="guardian_phone"
            value={data.guardian_phone || ''}
            onChange={(e) => onChange('guardian_phone', e.target.value)}
            placeholder="Phone number"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="guardian_email">Guardian Email</Label>
          <Input
            id="guardian_email"
            type="email"
            value={data.guardian_email || ''}
            onChange={(e) => onChange('guardian_email', e.target.value)}
            placeholder="Email address"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="address">Address</Label>
        <Input
          id="address"
          value={data.address || ''}
          onChange={(e) => onChange('address', e.target.value)}
          placeholder="Enter address"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="enrollment_year">Enrollment Year *</Label>
          <Input
            id="enrollment_year"
            type="number"
            value={data.enrollment_year || new Date().getFullYear()}
            onChange={(e) => onChange('enrollment_year', parseInt(e.target.value))}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="class_id">Class</Label>
          <Select
            value={data.class_id || 'none'}
            onValueChange={(value) =>
              onChange('class_id', value === 'none' ? null : value)
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select class" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No class</SelectItem>
              {classes.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
