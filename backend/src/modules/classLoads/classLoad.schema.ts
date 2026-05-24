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

const timeString = z
  .string()
  .regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Time must be HH:MM (24h)');

const slotSchema = z
  .object({
    id: z.string().optional(),
    dayOfWeek: z.number().int().min(0).max(6),
    timeStart: timeString,
    timeEnd: timeString,
    room: z.string().optional(),
  })
  .refine(
    (s) => {
      const [sh, sm] = s.timeStart.split(':').map(Number);
      const [eh, em] = s.timeEnd.split(':').map(Number);
      return eh * 60 + em > sh * 60 + sm;
    },
    { message: 'timeEnd must be after timeStart', path: ['timeEnd'] },
  );

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
  slots: z.array(slotSchema).optional(),
  weights: weightsSchema.optional().default({ ww: 0.2, pt: 0.6, qa: 0.2 }),
});

export const classLoadIdSchema = z.object({ id: z.string().min(1) });

export const updateClassLoadSchema = z.object({
  roomNumber: z.string().optional(),
  quarter: z.enum(['Q1', 'Q2', 'Q3', 'Q4']).optional(),
  schedule: z
    .object({
      dayOfWeek: z.array(z.number().int().min(0).max(6)).default([]),
      timeStart: z.string().default(''),
      timeEnd: z.string().default(''),
    })
    .optional(),
  slots: z.array(slotSchema).optional(),
  weights: weightsSchema.optional(),
});
