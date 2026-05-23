import { z } from 'zod';

const lrnSchema = z
  .string()
  .length(12, 'LRN must be exactly 12 digits')
  .regex(/^\d{12}$/, 'LRN must contain only digits');

const guardianSchema = z.object({
  name:          z.string().default(''),
  relationship:  z.string().default(''),
  contactNumber: z.string().default(''),
});

export const createStudentSchema = z.object({
  lrn:          lrnSchema,
  lastName:     z.string().min(1, 'Last name is required'),
  firstName:    z.string().min(1, 'First name is required'),
  middleInitial: z.string().max(2).default(''),
  gender:       z.enum(['M', 'F']),
  birthday:     z.string().optional(),
  classLoadId:  z.string().min(1, 'Class load is required'),
  guardian:     guardianSchema.optional(),
});

export const updateStudentSchema = z.object({
  lastName:     z.string().min(1).optional(),
  firstName:    z.string().min(1).optional(),
  middleInitial: z.string().max(2).optional(),
  gender:       z.enum(['M', 'F']).optional(),
  birthday:     z.string().optional(),
  guardian:     guardianSchema.optional(),
});

export const transferStudentSchema = z.object({
  classLoadId: z.string().min(1, 'Class load is required'),
});

export const importStudentsSchema = z.object({
  classLoadId: z.string().min(1),
  students: z.array(z.object({
    lrn:          lrnSchema,
    lastName:     z.string().min(1),
    firstName:    z.string().min(1),
    middleInitial: z.string().max(2).default(''),
    gender:       z.enum(['M', 'F']),
    birthday:     z.string().optional(),
    guardian:     guardianSchema.optional(),
  })),
});

export const listStudentsQuerySchema = z.object({
  q:           z.string().optional(),
  classLoadId: z.string().optional(),
  page:        z.coerce.number().int().min(1).default(1),
  limit:       z.coerce.number().int().min(1).max(100).default(50),
});

export const studentIdParamSchema = z.object({ id: z.string().min(1) });
export const lrnParamSchema        = z.object({ lrn: z.string().length(12) });
