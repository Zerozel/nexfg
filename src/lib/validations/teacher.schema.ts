import { z } from 'zod';

export const teacherSchema = z.object({
  full_name: z.string().min(2, 'Name is required'),
  email: z.string().email('Invalid email'),
  role: z.enum(['teacher', 'admin', 'principal']),
});

export type TeacherFormData = z.infer<typeof teacherSchema>;
