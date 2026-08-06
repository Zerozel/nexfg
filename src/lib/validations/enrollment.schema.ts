import { z } from 'zod';

export const singleEnrollmentSchema = z.object({
  student_id: z.string().uuid('Invalid student'),
  class_id: z.string().uuid('Invalid class'),
  term_id: z.string().uuid('Invalid term'),
});

export const bulkEnrollmentSchema = z.object({
  student_ids: z.array(z.string().uuid()).min(1, 'At least one student is required'),
  class_id: z.string().uuid('Invalid class'),
  term_id: z.string().uuid('Invalid term'),
});

export type SingleEnrollmentFormData = z.infer<typeof singleEnrollmentSchema>;
export type BulkEnrollmentFormData = z.infer<typeof bulkEnrollmentSchema>;
