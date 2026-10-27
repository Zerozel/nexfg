// src/components/super-admin/SchoolEditModal.tsx
'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { LoaderCircle, AlertTriangle } from 'lucide-react';

interface SchoolEditModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initial: {
    name: string;
    email: string | null;
    phone: string | null;
    address: string | null;
    city: string | null;
    state: string | null;
    country: string | null;
    slug: string;
  };
  onSubmit: (data: {
    name: string;
    email: string | null;
    phone: string | null;
    address: string | null;
    city: string | null;
    state: string | null;
    country: string | null;
  }) => Promise<void>;
  isLoading: boolean;
}

export function SchoolEditModal({
  open,
  onOpenChange,
  initial,
  onSubmit,
  isLoading,
}: SchoolEditModalProps) {
  const [formData, setFormData] = useState({
    name: initial.name,
    email: initial.email ?? '',
    phone: initial.phone ?? '',
    address: initial.address ?? '',
    city: initial.city ?? '',
    state: initial.state ?? '',
    country: initial.country ?? 'Nigeria',
  });

  // Reset form when the modal reopens with new initial values
  useEffect(() => {
    if (open) {
      setFormData({
        name: initial.name,
        email: initial.email ?? '',
        phone: initial.phone ?? '',
        address: initial.address ?? '',
        city: initial.city ?? '',
        state: initial.state ?? '',
        country: initial.country ?? 'Nigeria',
      });
    }
  }, [open, initial]);

  const nameChanged = formData.name.trim() !== initial.name.trim();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({
      name: formData.name.trim(),
      email: formData.email.trim() || null,
      phone: formData.phone.trim() || null,
      address: formData.address.trim() || null,
      city: formData.city.trim() || null,
      state: formData.state.trim() || null,
      country: formData.country.trim() || 'Nigeria',
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[560px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit School Details</DialogTitle>
          <DialogDescription>
            Update the school&apos;s public identity. Subscription, principal,
            and administrator are managed separately.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>School Name *</Label>
            <Input
              value={formData.name}
              onChange={(e) =>
                setFormData((p) => ({ ...p, name: e.target.value }))
              }
              required
            />
          </div>

          {nameChanged && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-900">
              <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5" />
              <div>
                Changing the school name also changes the public URL from{' '}
                <strong>{initial.slug}.nexaforges.me</strong> to{' '}
                <strong>
                  {formData.name
                    .toLowerCase()
                    .replace(/[^a-z0-9]+/g, '-')
                    .replace(/^-|-$/g, '')}
                  .nexaforges.me
                </strong>
                . Existing links will break.
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>School Email</Label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, email: e.target.value }))
                }
                placeholder="info@school.edu.ng"
              />
            </div>
            <div className="space-y-2">
              <Label>School Phone</Label>
              <Input
                value={formData.phone}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, phone: e.target.value }))
                }
                placeholder="0803 xxx xxxx"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Street Address</Label>
            <Input
              value={formData.address}
              onChange={(e) =>
                setFormData((p) => ({ ...p, address: e.target.value }))
              }
              placeholder="12 Adeola Street, Ikeja"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-2">
              <Label>City</Label>
              <Input
                value={formData.city}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, city: e.target.value }))
                }
                placeholder="Lagos"
              />
            </div>
            <div className="space-y-2">
              <Label>State</Label>
              <Input
                value={formData.state}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, state: e.target.value }))
                }
                placeholder="Lagos"
              />
            </div>
            <div className="space-y-2">
              <Label>Country</Label>
              <Input
                value={formData.country}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, country: e.target.value }))
                }
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && (
                <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
              )}
              Save Changes
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
