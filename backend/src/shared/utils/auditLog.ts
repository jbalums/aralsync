import { AuditLog } from '../../database/models/AuditLog.model';

export interface AuditParams {
  schoolId?: string;
  actorId: string;
  actorName: string;
  action: string;
  target: string;
  tone: string;
  metadata?: Record<string, unknown>;
}

export async function logAudit(params: AuditParams): Promise<void> {
  if (!params.schoolId) return;
  try {
    await AuditLog.create(params);
  } catch {
    // fire-and-forget — never propagates
  }
}
