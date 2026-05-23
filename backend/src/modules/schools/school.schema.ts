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
