import { z } from 'zod';

export const quarterSchema = z.enum(['Q1', 'Q2', 'Q3', 'Q4']);

export const classLoadQuarterSchema = z.object({
  classLoadId: z.string().min(1),
  quarter:     quarterSchema,
});

export const quarterlyGradeQuerySchema = z.object({
  classLoadId: z.string().min(1),
  quarter:     quarterSchema,
});
