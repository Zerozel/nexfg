'use client';

import { useState } from 'react';
import { SocialLinks } from './SocialLinks';
import { toast } from 'sonner';

interface ContactSectionProps {
  slug: string;
  primaryColor: string;
  contactEmail: string | null;
  contactPhone: string | null;
  address: string | null;
  socialLinks: { facebook?: string | null; twitter?: string | null; instagram?: string | null } | null;
}

export function ContactSection({ slug, primaryColor, contactEmail, contactPhone, address, socialLinks }: ContactSectionProps) {
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
    <section className="py-16 md:py-24">
      <div className="max-w-[1200px] mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-2" style={{ color: '#1A1A2E' }}>Contact Us</h2>
          <div className="w-16 h-1 mx-auto rounded-full" style={{ backgroundColor: primaryColor }} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="space-y-6">
            {contactEmail && (
              <div className="flex items-start gap-3">
                <span className="text-xl mt-1">✉️</span>
                <div><p className="font-medium text-gray-900">Email</p><p className="text-gray-600">{contactEmail}</p></div>
              </div>
            )}
            {contactPhone && (
              <div className="flex items-start gap-3">
                <span className="text-xl mt-1">📞</span>
                <div><p className="font-medium text-gray-900">Phone</p><p className="text-gray-600">{contactPhone}</p></div>
              </div>
            )}
            {address && (
              <div className="flex items-start gap-3">
                <span className="text-xl mt-1">📍</span>
                <div><p className="font-medium text-gray-900">Address</p><p className="text-gray-600">{address}</p></div>
              </div>
            )}
            <div className="pt-4">
              <p className="font-medium text-gray-900 mb-2">Follow Us</p>
              <SocialLinks links={socialLinks} />
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <input type="text" placeholder="Full Name" required value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2" style={{ '--tw-ring-color': primaryColor } as any} />
            <input type="email" placeholder="Email" required value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2" style={{ '--tw-ring-color': primaryColor } as any} />
            <textarea placeholder="Message" required rows={4} value={form.message} onChange={(e) => setForm((p) => ({ ...p, message: e.target.value }))} className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 resize-none" style={{ '--tw-ring-color': primaryColor } as any} />
            <button type="submit" disabled={isSubmitting} className="w-full px-6 py-3 rounded-lg font-medium text-white transition-all hover:scale-105 disabled:opacity-50" style={{ backgroundColor: primaryColor }}>
              {isSubmitting ? 'Sending...' : 'Send Message →'}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
