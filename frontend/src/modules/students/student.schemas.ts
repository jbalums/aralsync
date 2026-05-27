import { z } from 'zod';

export const addStudentSchema = z.object({
  lrn:                  z.string().length(12, 'LRN must be 12 digits').regex(/^\d{12}$/, 'LRN must contain only digits'),
  lastName:             z.string().min(1, 'Required'),
  firstName:            z.string().min(1, 'Required'),
  middleName:           z.string().max(60).optional(),
  gender:               z.enum(['M', 'F']),
  birthday:             z.string().optional(),
  classLoadId:          z.string().min(1, 'Select a class'),
  guardianName:         z.string().default(''),
  guardianRelationship: z.string().default(''),
  guardianContact:      z.string().default(''),
});
export type AddStudentFormValues = z.infer<typeof addStudentSchema>;

export const editStudentSchema = z.object({
  lastName:             z.string().min(1, 'Required'),
  firstName:            z.string().min(1, 'Required'),
  middleName:           z.string().max(60).optional(),
  gender:               z.enum(['M', 'F']),
  birthday:             z.string().optional(),
  guardianName:         z.string().optional(),
  guardianRelationship: z.string().optional(),
  guardianContact:      z.string().optional(),
});
export type EditStudentFormValues = z.infer<typeof editStudentSchema>;
