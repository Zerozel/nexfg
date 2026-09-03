import { z } from 'zod';

// Helper to handle empty strings -> null
const emptyToNull = (val: any) => (val === '' ? null : val);

export const studentSchema = z.object({
  full_name: z.string().min(2, 'Name is required'),
  admission_number: z.string().transform(emptyToNull).nullish(),
  date_of_birth: z.string().optional().nullable().transform(emptyToNull),
  gender: z.enum(['male', 'female', 'other']).optional().nullable(),
  guardian_name: z.string().optional().nullable().transform(emptyToNull),
  guardian_phone: z.string().optional().nullable().transform(emptyToNull),
  guardian_email: z.string().optional().nullable().transform(emptyToNull),
  address: z.string().optional().nullable().transform(emptyToNull),
  enrollment_year: z.number({
    invalid_type_error: 'Enrollment year must be a number',
  })
    .min(2000, 'Enrollment year must be at least 2000')
    .max(new Date().getFullYear(), 'Enrollment year cannot be in the future'),
  class_id: z.string().uuid().optional().nullable().transform(emptyToNull),
});

export type StudentFormData = z.infer<typeof studentSchema>;
