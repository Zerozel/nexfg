import { z } from 'zod';

// Nigerian academic sessions are written as a two-year span, e.g. "2024/2025".
const sessionNamePattern = /^\d{4}\/\d{4}$/;

// Base object schema (a ZodObject, so `.partial()` is available for PUT/PATCH).
export const academicYearBaseSchema = z.object({
  name: z
    .string()
    .regex(sessionNamePattern, 'Use the format YYYY/YYYY (e.g. 2024/2025)'),
  start_date: z.string().optional().nullable(),
  end_date: z.string().optional().nullable(),
  is_current: z.boolean().optional(),
});

// The second year must immediately follow the first (e.g. 2024/2025).
function isConsecutiveSession(name?: string): boolean {
  if (!name) return true; // nothing to validate (e.g. partial update without name)
  const [start, end] = name.split('/').map(Number);
  return end === start + 1;
}

// Full schema for creation (POST).
export const academicYearSchema = academicYearBaseSchema.refine(
  (data) => isConsecutiveSession(data.name),
  {
    message: 'The second year must immediately follow the first (e.g. 2024/2025)',
    path: ['name'],
  }
);

// Partial schema for updates (PUT/PATCH) — all fields optional, same name rule.
export const academicYearUpdateSchema = academicYearBaseSchema
  .partial()
  .refine((data) => isConsecutiveSession(data.name), {
    message: 'The second year must immediately follow the first (e.g. 2024/2025)',
    path: ['name'],
  });

export type AcademicYearFormData = z.infer<typeof academicYearSchema>;
