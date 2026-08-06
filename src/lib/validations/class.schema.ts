import { z } from 'zod';

export const classSchema = z.object({
  name: z.string().min(2, 'Class name is required'),
  academic_year_id: z.string().uuid('Invalid academic year'),
  teacher_id: z.string().uuid().optional().nullable(),
});

export type ClassFormData = z.infer<typeof classSchema>;
