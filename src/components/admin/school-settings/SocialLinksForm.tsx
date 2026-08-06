'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface SocialLinksFormProps {
  data: {
    facebook: string;
    twitter: string;
    instagram: string;
  };
  onChange: (field: string, value: string) => void;
  onSave: () => Promise<void>;
  isLoading: boolean;
}

export function SocialLinksForm({ data, onChange, onSave, isLoading }: SocialLinksFormProps) {
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="facebook">Facebook</Label>
        <Input
          id="facebook"
          value={data.facebook}
          onChange={(e) => onChange('facebook', e.target.value)}
          placeholder="https://facebook.com/school"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="twitter">Twitter</Label>
        <Input
          id="twitter"
          value={data.twitter}
          onChange={(e) => onChange('twitter', e.target.value)}
          placeholder="https://twitter.com/school"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="instagram">Instagram</Label>
        <Input
          id="instagram"
          value={data.instagram}
          onChange={(e) => onChange('instagram', e.target.value)}
          placeholder="https://instagram.com/school"
        />
      </div>

      <Button type="submit" disabled={isLoading}>
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {isLoading ? 'Saving...' : 'Save Changes'}
      </Button>
    </form>
  );
}
