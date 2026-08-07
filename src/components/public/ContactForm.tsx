'use client';

import { useState } from 'react';
import { toast } from 'sonner';

interface ContactFormProps {
  slug: string;
  primaryColor: string;
}

export function ContactForm({ slug, primaryColor }: ContactFormProps) {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/public/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ school_slug: slug, ...form }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success('Message sent successfully!');
      setForm({ name: '', email: '', message: '' });
    } catch (err: any) {
      toast.error(err.message || 'Failed to send message');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">
      <input type="text" placeholder="Full Name" required value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2" />
      <input type="email" placeholder="Email" required value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2" />
      <textarea placeholder="Message" required rows={4} value={form.message} onChange={(e) => setForm((p) => ({ ...p, message: e.target.value }))} className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 resize-none" />
      <button type="submit" disabled={isSubmitting} className="w-full px-6 py-3 rounded-lg font-medium text-white transition-all hover:scale-105 disabled:opacity-50" style={{ backgroundColor: primaryColor }}>
        {isSubmitting ? 'Sending...' : 'Send Message →'}
      </button>
    </form>
  );
}
