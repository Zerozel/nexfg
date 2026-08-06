import { z } from 'zod';

export const schoolSettingsSchema = z.object({
  name: z.string().min(2, 'School name is required').optional(),
  email: z.string().email('Invalid email').optional().nullable(),
  phone: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  motto: z.string().optional().nullable(),
  website_enabled: z.boolean().optional(),
  website_theme: z.object({
    primary_color: z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Invalid color format'),
    font: z.enum(['Inter', 'Roboto', 'Open Sans', 'Montserrat', 'Poppins']),
  }).optional(),
  website_content: z.object({
    hero_title: z.string().optional().nullable(),
    hero_subtitle: z.string().optional().nullable(),
    about_text: z.string().optional().nullable(),
    contact_email: z.string().email('Invalid email').optional().nullable(),
    contact_phone: z.string().optional().nullable(),
    address: z.string().optional().nullable(),
    gallery: z.array(z.object({
      url: z.string().url('Invalid URL'),
      type: z.enum(['video']),
    })).optional(),
  }).optional(),
  social_links: z.object({
    facebook: z.string().url('Invalid URL').optional().nullable(),
    twitter: z.string().url('Invalid URL').optional().nullable(),
    instagram: z.string().url('Invalid URL').optional().nullable(),
  }).optional(),
});

export type SchoolSettingsFormData = z.infer<typeof schoolSettingsSchema>;
