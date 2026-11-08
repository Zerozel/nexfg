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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { LoaderCircle, AlertTriangle, Check } from 'lucide-react';

interface TemplateOption {
  key: string;
  name: string;
  description: string;
  is_premium?: boolean;
  is_allowed?: boolean;
}

interface SchoolEditModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  schoolId: string;
  initial: {
    name: string;
    email: string | null;
    phone: string | null;
    address: string | null;
    city: string | null;
    state: string | null;
    country: string | null;
    slug: string;
    report_card_template?: string | null;
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
  onTemplateChanged?: (newKey: string) => void;
  isLoading: boolean;
}

export function SchoolEditModal({
  open,
  onOpenChange,
  schoolId,
  initial,
  onSubmit,
  onTemplateChanged,
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

  // Template state — separate from the identity form
  const [templateKey, setTemplateKey] = useState(
    initial.report_card_template || 'classic_nigerian'
  );
  const [templateSaving, setTemplateSaving] = useState(false);
  const [templateError, setTemplateError] = useState<string | null>(null);
  const [templateSuccess, setTemplateSuccess] = useState(false);

  const [templateOptions, setTemplateOptions] = useState<TemplateOption[]>([]);
  const [templatesLoading, setTemplatesLoading] = useState(false);

  // Demo quota — null means unlimited (paid tier).
  const [demoRemaining, setDemoRemaining] = useState<number | null>(null);

  // Reset form when the modal reopens
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
      setTemplateKey(initial.report_card_template || 'classic_nigerian');
      setTemplateError(null);
      setTemplateSuccess(false);
      setDemoRemaining(null);
    }
  }, [open, initial]);

  // Fetch available templates when the modal opens
  useEffect(() => {
    if (!open) return;
    setTemplatesLoading(true);
    fetch(`/api/super-admin/schools/${schoolId}/template`)
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          setTemplateOptions(data.templates || []);
          if (
            typeof data.demo_uses_remaining === 'number' ||
            data.demo_uses_remaining === null
          ) {
            setDemoRemaining(data.demo_uses_remaining);
          }
        }
      })
      .catch((err) => {
        console.error('Failed to load templates:', err);
      })
      .finally(() => setTemplatesLoading(false));
  }, [open, schoolId]);

  const nameChanged = formData.name.trim() !== initial.name.trim();
  const templateChanged =
    templateKey !== (initial.report_card_template || 'classic_nigerian');

  const selectedOption = templateOptions.find((t) => t.key === templateKey);

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

  const handleSaveTemplate = async () => {
    setTemplateSaving(true);
    setTemplateError(null);
    setTemplateSuccess(false);
    try {
      const res = await fetch(
        `/api/super-admin/schools/${schoolId}/template`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ template_key: templateKey }),
        }
      );
      const data = await res.json();
      if (!res.ok) {
        setTemplateError(data.error || 'Failed to update template');
        return;
      }
      setTemplateSuccess(true);
      onTemplateChanged?.(templateKey);
      setTimeout(() => setTemplateSuccess(false), 2500);

      // Refresh demo quota after switch (the PATCH response doesn't
      // include it, so re-fetch the GET endpoint).
      fetch(`/api/super-admin/schools/${schoolId}/template`)
        .then((r) => r.json())
        .then((d) => {
          if (d.success) {
            if (typeof d.demo_uses_remaining === 'number' || d.demo_uses_remaining === null) {
              setDemoRemaining(d.demo_uses_remaining);
            }
          }
        })
        .catch(() => {});
    } catch (err: any) {
      setTemplateError(err?.message || 'Network error');
    } finally {
      setTemplateSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[560px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit School Details</DialogTitle>
          <DialogDescription>
            Update the school&apos;s public identity and report card template.
            Subscription and administrator are managed separately.
          </DialogDescription>
        </DialogHeader>

        {/* ── Identity form ── */}
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

        {/* ── Template section ── */}
        <div className="pt-4 border-t space-y-3">
          <div>
            <Label>Report Card Template</Label>
            <p className="text-xs text-gray-500 mt-1">
              Controls the layout used when printing class or student report
              cards for this school.
            </p>
          </div>

          <div className="flex gap-2">
            <Select
              value={templateKey}
              onValueChange={(v) => {
                setTemplateKey(v);
                setTemplateError(null);
                setTemplateSuccess(false);
              }}
              disabled={templatesLoading || templateSaving}
            >
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Select a template" />
              </SelectTrigger>
              <SelectContent>
                {templateOptions.map((t) => {
                  const locked = t.is_allowed === false && t.key !== templateKey;
                  return (
                    <SelectItem key={t.key} value={t.key} disabled={locked}>
                      <span className="flex items-center gap-2">
                        {t.name}
                        {locked && (
                          <span className="text-[10px] uppercase tracking-wide text-amber-600">
                            Locked
                          </span>
                        )}
                      </span>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>

            <Button
              type="button"
              onClick={handleSaveTemplate}
              disabled={
                !templateChanged || templateSaving || templatesLoading
              }
            >
              {templateSaving && (
                <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
              )}
              {templateSuccess ? (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Saved
                </>
              ) : (
                'Apply'
              )}
            </Button>
          </div>

          {/* ── Demo quota banner ── */}
          {demoRemaining !== null && (
            <p
              className={
                demoRemaining > 0
                  ? 'text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded p-2'
                  : 'text-xs text-red-700 bg-red-50 border border-red-200 rounded p-2'
              }
            >
              {demoRemaining > 0 ? (
                <>
                  Demo renders remaining on premium templates:{' '}
                  <strong>{demoRemaining}</strong> of 10.
                </>
              ) : (
                <>
                  Demo quota exhausted. Upgrade the school&apos;s plan to print
                  premium report cards again.
                </>
              )}
            </p>
          )}

          {selectedOption && (
            <p className="text-xs text-gray-600 leading-relaxed">
              {selectedOption.description}
            </p>
          )}

          {templateError && (
            <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded p-2">
              {templateError}
            </p>
          )}

          {templateSuccess && (
            <p className="text-xs text-green-700 bg-green-50 border border-green-200 rounded p-2">
              Template updated. New PDF downloads will use this template.
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
