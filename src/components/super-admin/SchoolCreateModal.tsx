'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { LoaderCircle, Copy, Printer, Check } from 'lucide-react';

interface SchoolCreateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: Record<string, any>) => Promise<any>;
  isLoading: boolean;
}

export function SchoolCreateModal({ open, onOpenChange, onSubmit, isLoading }: SchoolCreateModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    admin_full_name: '',
    admin_email: '',
    admin_password: '',
    phone: '',
    subscription_tier: 'trial' as string,
  });
  const [result, setResult] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  const generatePassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%&*';
    let pwd = '';
    for (let i = 0; i < 12; i++) {
      pwd += chars[Math.floor(Math.random() * chars.length)];
    }
    setFormData((prev) => ({ ...prev, admin_password: pwd }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await onSubmit(formData);
    setResult(res);
  };

  const credentialText = result
    ? `School: ${result.school.name}\nSubdomain: ${result.school.subdomain}\nAdmin: ${result.admin.full_name}\nEmail: ${result.admin.email}\nPassword: ${result.admin.temporary_password}\nLogin URL: ${result.login_url}`
    : '';

  const handleCopy = async () => {
    await navigator.clipboard.writeText(credentialText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    const w = window.open('', '_blank');
    if (w) {
      w.document.write(`<pre>${credentialText}</pre>`);
      w.document.close();
      w.print();
    }
  };

  const resetForm = () => {
    setResult(null);
    setFormData({ name: '', admin_full_name: '', admin_email: '', admin_password: '', phone: '', subscription_tier: 'trial' });
  };

  const handleOpenChange = (next: boolean) => {
    if (!next) resetForm();
    onOpenChange(next);
  };

  const handleDone = () => {
    resetForm();
    onOpenChange(false);
  };

  if (result) {
    return (
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>School Created Successfully</DialogTitle>
            <DialogDescription>
              Share these credentials with the school admin manually.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 bg-muted p-4 rounded-lg">
            <p><strong>School:</strong> {result.school.name}</p>
            <p><strong>Subdomain:</strong> {result.school.subdomain}</p>
            <p><strong>Admin:</strong> {result.admin.full_name}</p>
            <p><strong>Email:</strong> {result.admin.email}</p>
            <p><strong>Password:</strong> {result.admin.temporary_password}</p>
            <p><strong>Login URL:</strong> {result.login_url}</p>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={handlePrint}><Printer className="mr-2 h-4 w-4" />Print</Button>
            <Button variant="outline" onClick={handleCopy}>
              {copied ? <Check className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />}
              {copied ? 'Copied' : 'Copy'}
            </Button>
            <Button onClick={handleDone}>Done</Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New School</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>School Name *</Label>
            <Input value={formData.name} onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))} required />
          </div>
          <div className="space-y-2">
            <Label>Admin Full Name *</Label>
            <Input value={formData.admin_full_name} onChange={(e) => setFormData((p) => ({ ...p, admin_full_name: e.target.value }))} required />
          </div>
          <div className="space-y-2">
            <Label>Admin Email *</Label>
            <Input type="email" value={formData.admin_email} onChange={(e) => setFormData((p) => ({ ...p, admin_email: e.target.value }))} required />
          </div>
          <div className="space-y-2">
            <Label>Admin Password</Label>
            <div className="flex gap-2">
              <Input value={formData.admin_password} onChange={(e) => setFormData((p) => ({ ...p, admin_password: e.target.value }))} className="flex-1" />
              <Button type="button" variant="outline" onClick={generatePassword}>Generate</Button>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Phone</Label>
            <Input value={formData.phone} onChange={(e) => setFormData((p) => ({ ...p, phone: e.target.value }))} />
          </div>
          <div className="space-y-2">
            <Label>Subscription Tier *</Label>
            <Select value={formData.subscription_tier} onValueChange={(v) => setFormData((p) => ({ ...p, subscription_tier: v }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="trial">Trial</SelectItem>
                <SelectItem value="free">Free</SelectItem>
                <SelectItem value="basic">Basic</SelectItem>
                <SelectItem value="pro">Pro</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
              Create School
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
