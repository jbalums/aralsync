import { z } from 'zod';

const syncRecordSchema = z.object({
  tableName:  z.string().min(1),
  recordId:   z.string().min(1),
  operation:  z.enum(['create', 'update', 'delete']),
  payload:    z.record(z.string(), z.unknown()),
});

export const pushSchema = z.object({
  records: z.array(syncRecordSchema).min(1).max(500),
});

export const pullSchema = z.object({
  lastSyncAt: z.string().datetime().optional(),
});
