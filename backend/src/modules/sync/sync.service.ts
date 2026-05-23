import mongoose from 'mongoose';
import { AttendanceRecord } from '../../database/models/AttendanceRecord.model';
import { GradeEntry }       from '../../database/models/GradeEntry.model';
import { QuarterlyGrade }   from '../../database/models/QuarterlyGrade.model';
import { ClassLoad }        from '../../database/models/ClassLoad.model';
import { SyncLog }          from '../../database/models/SyncLog.model';

type SyncRecord = {
  tableName:  string;
  recordId:   string;
  operation:  'create' | 'update' | 'delete';
  payload:    Record<string, unknown>;
};

async function upsertRecord(record: SyncRecord): Promise<boolean> {
  const { tableName, operation, payload } = record;

  const p = payload as Record<string, unknown>;

  if (operation === 'delete') {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (tableName === 'attendanceRecords') await AttendanceRecord.deleteOne({ clientId: record.recordId } as any);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (tableName === 'gradeEntries')      await GradeEntry.deleteOne({ clientId: record.recordId } as any);
    return true;
  }

  if (tableName === 'attendanceRecords') {
    await AttendanceRecord.findOneAndUpdate(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      { classLoadId: p['classLoadId'], studentId: p['studentId'], date: new Date(p['date'] as string), session: p['session'] } as any,
      { $set: { status: p['status'], syncStatus: 'synced', clientId: record.recordId } },
      { upsert: true, new: true },
    );
    return true;
  }

  if (tableName === 'gradeEntries') {
    await GradeEntry.findOneAndUpdate(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      { classLoadId: p['classLoadId'], studentId: p['studentId'], quarter: p['quarter'], component: p['component'], columnLabel: p['columnLabel'] } as any,
      { $set: { score: p['score'], maxScore: p['maxScore'], syncStatus: 'synced', clientId: record.recordId } },
      { upsert: true, new: true },
    );
    return true;
  }

  return false;
}

export const syncService = {
  async push(records: SyncRecord[], teacherId: string, schoolId: string) {
    let processed = 0;
    const errors: string[] = [];

    for (const record of records) {
      try {
        const ok = await upsertRecord(record);
        if (ok) processed++;
      } catch (err) {
        errors.push(`${record.tableName}:${record.recordId} — ${(err as Error).message}`);
      }
    }

    await SyncLog.create({
      teacherId: new mongoose.Types.ObjectId(teacherId),
      schoolId:  new mongoose.Types.ObjectId(schoolId),
      type:       'push',
      recordCount: processed,
      status:     errors.length === 0 ? 'success' : 'failed',
      error:      errors.length > 0 ? errors.slice(0, 5).join('; ') : undefined,
    });

    return { processed, errors };
  },

  async pull(teacherId: string, schoolId: string, lastSyncAt?: string) {
    const since = lastSyncAt ? new Date(lastSyncAt) : new Date(0);

    const classLoads = await ClassLoad.find({ teacherId, isActive: true }).lean();
    const classLoadIds = classLoads.map(cl => cl._id);

    const [attendance, gradeEntries, quarterlyGrades] = await Promise.all([
      AttendanceRecord.find({ classLoadId: { $in: classLoadIds }, updatedAt: { $gt: since } }).lean(),
      GradeEntry.find({ classLoadId: { $in: classLoadIds }, updatedAt: { $gt: since } }).lean(),
      QuarterlyGrade.find({ classLoadId: { $in: classLoadIds }, updatedAt: { $gt: since } }).lean(),
    ]);

    const toRecord = (tableName: string, docs: unknown[]) =>
      docs.map(d => ({ tableName, payload: d }));

    const records = [
      ...toRecord('attendanceRecords', attendance),
      ...toRecord('gradeEntries', gradeEntries),
      ...toRecord('quarterlyGrades', quarterlyGrades),
    ];

    await SyncLog.create({
      teacherId: new mongoose.Types.ObjectId(teacherId),
      schoolId:  new mongoose.Types.ObjectId(schoolId),
      type:       'pull',
      recordCount: records.length,
      status:     'success',
    });

    return { records, pulledAt: new Date().toISOString() };
  },

  async getStatus(teacherId: string) {
    const lastPush = await SyncLog
      .findOne({ teacherId: new mongoose.Types.ObjectId(teacherId), type: 'push', status: 'success' })
      .sort({ createdAt: -1 })
      .lean() as unknown as (Record<string, unknown> | null);

    return {
      lastSyncAt: lastPush ? (lastPush['createdAt'] as Date).toISOString() : null,
    };
  },

  async getLogs(teacherId: string, limit = 20) {
    const logs = await SyncLog
      .find({ teacherId: new mongoose.Types.ObjectId(teacherId) })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return logs.map((l: any) => ({
      id:          (l._id as mongoose.Types.ObjectId).toString(),
      type:        l.type as string,
      recordCount: l.recordCount as number,
      status:      l.status as string,
      error:       l.error as string | undefined,
      createdAt:   (l.createdAt as Date).toISOString(),
    }));
  },
};
