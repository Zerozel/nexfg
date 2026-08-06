import { z } from 'zod';

export const teacherAssignmentSchema = z.object({
  class_id: z.string().uuid('Invalid class'),
  subject_id: z.string().uuid('Invalid subject'),
  teacher_id: z.string().uuid('Invalid teacher'),
});

export type TeacherAssignmentFormData = z.infer<typeof teacherAssignmentSchema>;
