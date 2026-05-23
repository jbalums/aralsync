import { z } from 'zod';

const scheduleTypeEnum = z.enum(['class', 'duty', 'meeting', 'break']);

export const createScheduleSchema = z.object({
  title:        z.string().min(1),
  section:      z.string().default(''),
  room:         z.string().default(''),
  dayOfWeek:    z.coerce.number().int().min(0).max(6),
  startH:       z.coerce.number().int().min(0).max(23),
  startM:       z.coerce.number().int().min(0).max(59).default(0),
  durMin:       z.coerce.number().int().min(1).max(480).default(60),
  type:         scheduleTypeEnum,
  classLoadId:  z.string().optional(),
  schoolYearId: z.string().optional(),
});

export const updateScheduleSchema = createScheduleSchema.partial().omit({ type: true }).extend({
  type: scheduleTypeEnum.optional(),
});

export const checkConflictSchema = z.object({
  dayOfWeek: z.coerce.number().int().min(0).max(6),
  startH:    z.coerce.number().int().min(0).max(23),
  startM:    z.coerce.number().int().min(0).max(59).default(0),
  durMin:    z.coerce.number().int().min(1).max(480),
  excludeId: z.string().optional(),
});

export const scheduleIdParamSchema = z.object({
  id: z.string().min(1),
});
