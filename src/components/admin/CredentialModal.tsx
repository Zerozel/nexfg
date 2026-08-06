'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Printer, Copy, Check, ClipboardCopy } from 'lucide-react';
import { useState } from 'react';

interface CredentialModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  teacher: {
    full_name: string;
    email: string;
    temporary_password: string;
  } | null;
}

export function CredentialModal({
  open,
  onOpenChange,
  teacher,
}: CredentialModalProps) {
  const [copied, setCopied] = useState(false);

  if (!teacher) return null;

  const loginUrl = 'https://nexaforges.me/login';

  const credentialText = `
Teacher Credentials
====================
Name: ${teacher.full_name}
Email: ${teacher.email}
Password: ${teacher.temporary_password}
Login URL: ${loginUrl}
  `.trim();

  const handleCopy = async () => {
    await navigator.clipboard.writeText(credentialText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Teacher Credentials</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 40px; }
              h2 { color: #333; }
              .credential { margin: 10px 0; padding: 10px; border: 1px solid #ddd; }
              .label { font-weight: bold; }
            </style>
          </head>
          <body>
            <h2>Teacher Credentials</h2>
            <div class="credential">
              <p><span class="label">Name:</span> ${teacher.full_name}</p>
              <p><span class="label">Email:</span> ${teacher.email}</p>
              <p><span class="label">Password:</span> ${teacher.temporary_password}</p>
              <p><span class="label">Login URL:</span> ${loginUrl}</p>
            </div>
            <p><em>Please change your password after first login.</em></p>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Teacher Credentials</DialogTitle>
          <DialogDescription>
            Share these credentials with the teacher securely. They will be
            prompted to change their password on first login.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Full Name</Label>
            <Input value={teacher.full_name} readOnly />
          </div>
          <div className="space-y-2">
            <Label>Email</Label>
            <Input value={teacher.email} readOnly />
          </div>
          <div className="space-y-2">
            <Label>Temporary Password</Label>
            <Input value={teacher.temporary_password} readOnly type="text" />
          </div>
          <div className="space-y-2">
            <Label>Login URL</Label>
            <Input value={loginUrl} readOnly />
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="mr-2 h-4 w-4" />
            Print Details
          </Button>
          <Button variant="outline" onClick={handleCopy}>
            {copied ? (
              <Check className="mr-2 h-4 w-4 text-green-500" />
            ) : (
              <ClipboardCopy className="mr-2 h-4 w-4" />
            )}
            {copied ? 'Copied!' : 'Copy Details'}
          </Button>
          <Button onClick={() => onOpenChange(false)}>Done</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
