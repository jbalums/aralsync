import { z } from 'zod';

const entrySchema = z.object({
  studentId:   z.string().min(1),
  component:   z.enum(['WW', 'PT', 'QA']),
  columnLabel: z.string().min(1).max(32),
  maxScore:    z.number().positive(),
  score:       z.number().min(0),
  clientId:    z.string().optional(),
});

export const bulkSaveSchema = z.object({
  classLoadId: z.string().min(1),
  quarter:     z.enum(['Q1', 'Q2', 'Q3', 'Q4']),
  entries:     z.array(entrySchema).min(1).max(200),
});

export const matrixQuerySchema = z.object({
  classLoadId: z.string().min(1),
  quarter:     z.enum(['Q1', 'Q2', 'Q3', 'Q4']),
});
