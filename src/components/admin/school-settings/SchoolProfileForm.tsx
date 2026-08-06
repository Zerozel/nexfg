'use client';

import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface SchoolProfileFormProps {
  data: {
    name: string;
    email: string;
    phone: string;
    address: string;
    motto: string;
  };
  onChange: (field: string, value: string) => void;
  onSave: () => Promise<void>;
  isLoading: boolean;
}

export function SchoolProfileForm({ data, onChange, onSave, isLoading }: SchoolProfileFormProps) {
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="name">School Name *</Label>
        <Input
          id="name"
          value={data.name}
          onChange={(e) => onChange('name', e.target.value)}
          placeholder="St. Mary's School"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={data.email}
          onChange={(e) => onChange('email', e.target.value)}
          placeholder="info@school.edu"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">Phone</Label>
        <Input
          id="phone"
          value={data.phone}
          onChange={(e) => onChange('phone', e.target.value)}
          placeholder="+234-800-123-4567"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="address">Address</Label>
        <Textarea
          id="address"
          value={data.address}
          onChange={(e) => onChange('address', e.target.value)}
          placeholder="123 Lagos Road, Abuja"
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="motto">Motto</Label>
        <Input
          id="motto"
          value={data.motto}
          onChange={(e) => onChange('motto', e.target.value)}
          placeholder="Excellence in Education"
        />
      </div>

      <Button type="submit" disabled={isLoading}>
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {isLoading ? 'Saving...' : 'Save Changes'}
      </Button>
    </form>
  );
}
