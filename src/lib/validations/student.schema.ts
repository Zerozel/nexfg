import { z } from 'zod';

export const studentSchema = z.object({
  full_name: z.string().min(2, 'Name is required'),
  date_of_birth: z.string().optional(),
  gender: z.enum(['male', 'female', 'other']).optional(),
  guardian_name: z.string().min(2, 'Guardian name is required'),
  guardian_phone: z.string().min(5, 'Phone number is required'),
  guardian_email: z.string().email('Invalid email').optional().or(z.literal('')),
  address: z.string().optional(),
  enrollment_year: z.number().min(2000).max(new Date().getFullYear()),
  class_id: z.string().uuid().optional().nullable(),
});

export type StudentFormData = z.infer<typeof studentSchema>;
