import { z } from 'zod';

export const studentSchema = z.object({
  full_name: z.string().min(2, 'Name is required'),
  date_of_birth: z.string().optional(),
  gender: z.enum(['male', 'female', 'other']).optional(),
  guardian_name: z.string().optional().nullable(), // ← Now optional
  guardian_phone: z.string().optional().nullable(), // ← Now optional
  guardian_email: z.string().email('Invalid email').optional().or(z.literal('')),
  address: z.string().optional(),
  enrollment_year: z.number().min(2000).max(new Date().getFullYear()),
  class_id: z.string().uuid().optional().nullable(),
});

export type StudentFormData = z.infer<typeof studentSchema>;
