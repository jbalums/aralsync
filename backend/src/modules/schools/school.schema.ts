import { z } from 'zod';

export const createSchoolYearSchema = z.object({
  label: z.string().min(1, 'Label is required'),
  startDate: z.string().datetime({ offset: true }).or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)),
  endDate: z.string().datetime({ offset: true }).or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)),
});

export const schoolIdParamSchema = z.object({ id: z.string().min(1) });

export const yearIdParamSchema = z.object({
  id: z.string().min(1),
  yearId: z.string().min(1),
});

export const createSchoolSchema = z.object({
  name: z.string().min(2, 'School name must be at least 2 characters'),
  schoolId: z.string().min(1, 'DepEd school ID is required'),
  division: z.string().min(2, 'Division is required'),
  district: z.string().optional(),
  address: z.string().optional(),
});

export const updateSchoolSchema = createSchoolSchema.partial();

export const bulkCreateSchoolsSchema = z.object({
  division: z.string().min(2, 'Division is required'),
  district: z.string().optional(),
  schools: z
    .array(
      z.object({
        schoolId: z.string().min(1),
        name: z.string().min(2),
        address: z.string().optional(),
      }),
    )
    .min(1, 'At least one school row is required')
    .max(500, 'Cannot import more than 500 schools at once'),
});
