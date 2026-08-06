import { z } from 'zod';

export const subjectSchema = z.object({
  name: z.string().min(2, 'Subject name is required'),
  code: z.string().min(2, 'Subject code is required').max(10),
});

export type SubjectFormData = z.infer<typeof subjectSchema>;
