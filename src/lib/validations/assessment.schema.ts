import { z } from 'zod';

export const assessmentSchema = z.object({
  name: z.string().min(3, 'Assessment name is required'),
  type: z.enum(['exam', 'test', 'quiz']),
  term_id: z.string().uuid('Invalid term'),
  class_id: z.string().uuid('Invalid class'),
  subject_id: z.string().uuid('Invalid subject'),
  max_score: z.number().positive('Max score must be greater than 0'),
  weight: z.number().min(0).max(1, 'Weight must be between 0 and 1'),
  date: z.string().optional().nullable(),
});

export type AssessmentFormData = z.infer<typeof assessmentSchema>;
