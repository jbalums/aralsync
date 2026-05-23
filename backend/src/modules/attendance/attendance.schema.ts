import { z } from 'zod';

const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

const submitRecordSchema = z.object({
  studentId:   z.string().min(1),
  classLoadId: z.string().min(1),
  date:        z.string().regex(dateRegex, 'Date must be YYYY-MM-DD'),
  session:     z.enum(['AM', 'PM']),
  status:      z.enum(['present', 'absent', 'late', 'excused']),
  clientId:    z.string().optional(),
});

export const submitAttendanceSchema = z.object({
  records: z.array(submitRecordSchema).min(1).max(200),
});

export const byDateQuerySchema = z.object({
  classLoadId: z.string().min(1),
  date:        z.string().regex(dateRegex, 'Date must be YYYY-MM-DD'),
  session:     z.enum(['AM', 'PM']),
});

export const summaryQuerySchema = z.object({
  classLoadId: z.string().min(1),
  startDate:   z.string().regex(dateRegex).optional(),
  endDate:     z.string().regex(dateRegex).optional(),
});

export const updateAttendanceSchema = z.object({
  status: z.enum(['present', 'absent', 'late', 'excused']),
});

export const bulkSyncSchema = z.object({
  records: z.array(submitRecordSchema).min(1).max(500),
});

export const attendanceIdParamSchema = z.object({
  id: z.string().min(1),
});

export const sf2SheetQuerySchema = z.object({
  classLoadId: z.string().min(1),
  month:       z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/, 'Month must be YYYY-MM'),
});
