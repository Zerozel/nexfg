import { z } from 'zod';

export const classSchema = z.object({
  name: z.string().min(2, 'Class name is required'),
  academic_year_id: z.string().uuid('Invalid academic year'),
  teacher_id: z.string().uuid().optional().nullable(),

  // Arms model fields (all optional so existing single-arm flows keep working).
  arms_count: z.number().int().min(1).max(10).optional(),
  base_name: z.string().optional(),
  display_order: z.number().int().optional(),

  // Per-arm teachers, keyed by arm letter ("A", "B", ...). Values are
  // teacher UUIDs or null for "no teacher".
  arm_teachers: z
    .record(z.string(), z.string().uuid().nullable())
    .optional(),
});

export type ClassFormData = z.infer<typeof classSchema>;
