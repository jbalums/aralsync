import { z } from 'zod';

const weightsSchema = z
  .object({
    ww: z.number().min(0).max(1),
    pt: z.number().min(0).max(1),
    qa: z.number().min(0).max(1),
  })
  .refine((w) => Math.abs(w.ww + w.pt + w.qa - 1) < 0.001, {
    message: 'Component weights must sum to 1.0',
  });

export const createClassLoadSchema = z.object({
  subjectName: z.string().min(1, 'Subject name is required'),
  gradeLevel: z.number().int().min(7).max(12),
  sectionName: z.string().min(1, 'Section name is required'),
  quarter: z.enum(['Q1', 'Q2', 'Q3', 'Q4']),
  roomNumber: z.string().default(''),
  schedule: z
    .object({
      dayOfWeek: z.array(z.number().int().min(0).max(6)).default([]),
      timeStart: z.string().default(''),
      timeEnd: z.string().default(''),
    })
    .optional(),
  weights: weightsSchema.optional().default({ ww: 0.2, pt: 0.6, qa: 0.2 }),
});

export const classLoadIdSchema = z.object({ id: z.string().min(1) });
