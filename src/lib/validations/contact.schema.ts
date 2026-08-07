import { z } from 'zod';

export const contactFormSchema = z.object({
  school_slug: z.string().min(1),
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Valid email is required'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
});
