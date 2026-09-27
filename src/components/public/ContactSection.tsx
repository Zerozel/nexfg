'use client';

import { useState } from 'react';
import { Mail, Phone, MapPin } from 'lucide-react';
import { SocialLinks } from './SocialLinks';
import { DESIGN_TOKENS } from '@/lib/public/design-tokens';
import { toast } from 'sonner';

interface ContactSectionProps {
  slug: string;
  primaryColor: string;
  contactEmail: string | null;
  contactPhone: string | null;
  address: string | null;
  socialLinks: {
    facebook?: string | null;
    twitter?: string | null;
    instagram?: string | null;
  } | null;
}

export function ContactSection({
  slug,
  primaryColor,
  contactEmail,
  contactPhone,
  address,
  socialLinks,
}: ContactSectionProps) {
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

  const inputStyle: React.CSSProperties = {
    fontFamily: 'var(--font-inter)',
    fontSize: '0.9375rem',
    color: DESIGN_TOKENS.neutral.ink,
    backgroundColor: DESIGN_TOKENS.neutral.surface,
    border: `1px solid ${DESIGN_TOKENS.neutral.line}`,
    borderRadius: DESIGN_TOKENS.radius.md,
    padding: '14px 16px',
    width: '100%',
    outline: 'none',
    transition: `border-color ${DESIGN_TOKENS.motion.fast}, box-shadow ${DESIGN_TOKENS.motion.fast}`,
  };

  return (
    <section
      className="py-24 md:py-32"
      style={{ backgroundColor: DESIGN_TOKENS.neutral.surfaceAlt }}
    >
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="text-center mb-16 max-w-2xl mx-auto">
          <div
            className="mb-5 inline-flex items-center gap-3"
            style={{ color: DESIGN_TOKENS.accent.goldDeep }}
          >
            <div
              className="w-12 h-px"
              style={{ backgroundColor: DESIGN_TOKENS.accent.gold }}
            />
            <span
              className="text-xs uppercase"
              style={{
                fontFamily: 'var(--font-inter)',
                letterSpacing: '0.2em',
                fontWeight: 600,
              }}
            >
              Get in Touch
            </span>
            <div
              className="w-12 h-px"
              style={{ backgroundColor: DESIGN_TOKENS.accent.gold }}
            />
          </div>

          <h2
            style={{
              fontFamily: 'var(--font-fraunces)',
              fontSize: DESIGN_TOKENS.type.display.lg,
              fontWeight: 400,
              lineHeight: 1.1,
              color: DESIGN_TOKENS.neutral.ink,
              letterSpacing: '-0.02em',
              fontVariationSettings: '"opsz" 72, "SOFT" 50',
            }}
          >
            We&apos;d love to hear from you.
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Left — contact details */}
          <div className="space-y-8">
            {contactEmail && (
              <div className="flex items-start gap-4">
                <div
                  className="flex-shrink-0 h-11 w-11 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: `${primaryColor}14` }}
                >
                  <Mail
                    className="h-5 w-5"
                    style={{ color: primaryColor }}
                    strokeWidth={1.75}
                  />
                </div>
                <div className="pt-1">
                  <div
                    className="text-xs uppercase mb-1"
                    style={{
                      fontFamily: 'var(--font-inter)',
                      letterSpacing: '0.15em',
                      fontWeight: 600,
                      color: DESIGN_TOKENS.neutral.inkMuted,
                    }}
                  >
                    Email
                  </div>
                  <a
                    href={`mailto:${contactEmail}`}
                    className="transition-colors hover:underline"
                    style={{
                      fontFamily: 'var(--font-inter)',
                      fontSize: '1rem',
                      color: DESIGN_TOKENS.neutral.ink,
                    }}
                  >
                    {contactEmail}
                  </a>
                </div>
              </div>
            )}

            {contactPhone && (
              <div className="flex items-start gap-4">
                <div
                  className="flex-shrink-0 h-11 w-11 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: `${primaryColor}14` }}
                >
                  <Phone
                    className="h-5 w-5"
                    style={{ color: primaryColor }}
                    strokeWidth={1.75}
                  />
                </div>
                <div className="pt-1">
                  <div
                    className="text-xs uppercase mb-1"
                    style={{
                      fontFamily: 'var(--font-inter)',
                      letterSpacing: '0.15em',
                      fontWeight: 600,
                      color: DESIGN_TOKENS.neutral.inkMuted,
                    }}
                  >
                    Phone
                  </div>
                  <a
                    href={`tel:${contactPhone}`}
                    className="transition-colors hover:underline"
                    style={{
                      fontFamily: 'var(--font-inter)',
                      fontSize: '1rem',
                      color: DESIGN_TOKENS.neutral.ink,
                    }}
                  >
                    {contactPhone}
                  </a>
                </div>
              </div>
            )}

            {address && (
              <div className="flex items-start gap-4">
                <div
                  className="flex-shrink-0 h-11 w-11 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: `${primaryColor}14` }}
                >
                  <MapPin
                    className="h-5 w-5"
                    style={{ color: primaryColor }}
                    strokeWidth={1.75}
                  />
                </div>
                <div className="pt-1">
                  <div
                    className="text-xs uppercase mb-1"
                    style={{
                      fontFamily: 'var(--font-inter)',
                      letterSpacing: '0.15em',
                      fontWeight: 600,
                      color: DESIGN_TOKENS.neutral.inkMuted,
                    }}
                  >
                    Address
                  </div>
                  <p
                    style={{
                      fontFamily: 'var(--font-inter)',
                      fontSize: '1rem',
                      color: DESIGN_TOKENS.neutral.ink,
                    }}
                  >
                    {address}
                  </p>
                </div>
              </div>
            )}

            {socialLinks &&
              (socialLinks.facebook ||
                socialLinks.twitter ||
                socialLinks.instagram) && (
                <div
                  className="pt-6"
                  style={{ borderTop: `1px solid ${DESIGN_TOKENS.neutral.line}` }}
                >
                  <div
                    className="text-xs uppercase mb-3"
                    style={{
                      fontFamily: 'var(--font-inter)',
                      letterSpacing: '0.15em',
                      fontWeight: 600,
                      color: DESIGN_TOKENS.neutral.inkMuted,
                    }}
                  >
                    Follow Us
                  </div>
                  <SocialLinks
                    links={socialLinks}
                    color={DESIGN_TOKENS.neutral.inkSoft}
                    hoverColor={DESIGN_TOKENS.accent.goldDeep}
                  />
                </div>
              )}
          </div>

          {/* Right — form */}
          <form
            onSubmit={handleSubmit}
            className="space-y-5 p-8 rounded-lg"
            style={{
              backgroundColor: DESIGN_TOKENS.neutral.surface,
              boxShadow: DESIGN_TOKENS.shadow.md,
            }}
          >
            <div>
              <label
                htmlFor="contact-name"
                className="block text-xs uppercase mb-2"
                style={{
                  fontFamily: 'var(--font-inter)',
                  letterSpacing: '0.1em',
                  fontWeight: 600,
                  color: DESIGN_TOKENS.neutral.inkSoft,
                }}
              >
                Your Name
              </label>
              <input
                id="contact-name"
                type="text"
                required
                value={form.name}
                onChange={(e) =>
                  setForm((p) => ({ ...p, name: e.target.value }))
                }
                style={inputStyle}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = primaryColor;
                  e.currentTarget.style.boxShadow = `0 0 0 3px ${primaryColor}1a`;
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor =
                    DESIGN_TOKENS.neutral.line;
                  e.currentTarget.style.boxShadow = 'none';
                }}
              />
            </div>

            <div>
              <label
                htmlFor="contact-email"
                className="block text-xs uppercase mb-2"
                style={{
                  fontFamily: 'var(--font-inter)',
                  letterSpacing: '0.1em',
                  fontWeight: 600,
                  color: DESIGN_TOKENS.neutral.inkSoft,
                }}
              >
                Email
              </label>
              <input
                id="contact-email"
                type="email"
                required
                value={form.email}
                onChange={(e) =>
                  setForm((p) => ({ ...p, email: e.target.value }))
                }
                style={inputStyle}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = primaryColor;
                  e.currentTarget.style.boxShadow = `0 0 0 3px ${primaryColor}1a`;
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor =
                    DESIGN_TOKENS.neutral.line;
                  e.currentTarget.style.boxShadow = 'none';
                }}
              />
            </div>

            <div>
              <label
                htmlFor="contact-message"
                className="block text-xs uppercase mb-2"
                style={{
                  fontFamily: 'var(--font-inter)',
                  letterSpacing: '0.1em',
                  fontWeight: 600,
                  color: DESIGN_TOKENS.neutral.inkSoft,
                }}
              >
                Message
              </label>
              <textarea
                id="contact-message"
                required
                rows={5}
                value={form.message}
                onChange={(e) =>
                  setForm((p) => ({ ...p, message: e.target.value }))
                }
                style={{ ...inputStyle, resize: 'none' }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = primaryColor;
                  e.currentTarget.style.boxShadow = `0 0 0 3px ${primaryColor}1a`;
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor =
                    DESIGN_TOKENS.neutral.line;
                  e.currentTarget.style.boxShadow = 'none';
                }}
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 rounded-lg font-semibold transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0"
              style={{
                fontFamily: 'var(--font-inter)',
                fontSize: '0.9375rem',
                backgroundColor: DESIGN_TOKENS.accent.gold,
                color: DESIGN_TOKENS.neutral.ink,
                boxShadow: DESIGN_TOKENS.shadow.md,
              }}
            >
              {isSubmitting ? 'Sending...' : 'Send Message'}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
