import mongoose from 'mongoose';
import { AttendanceRecord } from '../../database/models/AttendanceRecord.model';
import { ClassLoad }        from '../../database/models/ClassLoad.model';

type ClientRecord = {
  id:          string;
  classLoadId: string;
  studentId:   string;
  date:        string;
  session:     string;
  status:      string;
  syncStatus:  string;
  updatedAt:   string;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toClientRecord(r: any): ClientRecord {
  return {
    id:          (r._id as mongoose.Types.ObjectId).toString(),
    classLoadId: r.classLoadId.toString(),
    studentId:   r.studentId.toString(),
    date:        (r.date as Date).toISOString().slice(0, 10),
    session:     r.session as string,
    status:      r.status as string,
    syncStatus:  r.syncStatus as string,
    updatedAt:   (r.updatedAt as Date).toISOString(),
  };
}

type SubmitRecord = {
  studentId:   string;
  classLoadId: string;
  date:        string;
  session:     string;
  status:      string;
  clientId?:   string;
};

export const attendanceService = {
  async getByDate(classLoadId: string, date: string, session: string, teacherId: string) {
    const load = await ClassLoad.findOne({ _id: classLoadId, teacherId, isActive: true }).lean();
    if (!load) return null;

    const records = await AttendanceRecord.find({
      classLoadId,
      date:    new Date(date),
      session,
    }).lean();

    return records.map(toClientRecord);
  },

  async getSummary(classLoadId: string, teacherId: string, startDate?: string, endDate?: string) {
    const load = await ClassLoad.findOne({ _id: classLoadId, teacherId, isActive: true }).lean();
    if (!load) return null;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const matchStage: Record<string, any> = { classLoadId: new mongoose.Types.ObjectId(classLoadId) };
    if (startDate || endDate) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const dateFilter: Record<string, any> = {};
      if (startDate) dateFilter.$gte = new Date(startDate);
      if (endDate)   dateFilter.$lte = new Date(endDate);
      matchStage.date = dateFilter;
    }

    const rows = await AttendanceRecord.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id:     '$studentId',
          total:   { $sum: 1 },
          present: { $sum: { $cond: [{ $eq: ['$status', 'present'] }, 1, 0] } },
          late:    { $sum: { $cond: [{ $eq: ['$status', 'late']    }, 1, 0] } },
          absent:  { $sum: { $cond: [{ $eq: ['$status', 'absent']  }, 1, 0] } },
          excused: { $sum: { $cond: [{ $eq: ['$status', 'excused'] }, 1, 0] } },
        },
      },
    ]);

    return rows.map((r) => ({
      studentId: (r._id as mongoose.Types.ObjectId).toString(),
      total:     r.total as number,
      present:   r.present as number,
      late:      r.late as number,
      absent:    r.absent as number,
      excused:   r.excused as number,
      rate: (r.total as number) > 0
        ? Math.round((((r.present as number) + (r.late as number)) / (r.total as number)) * 100)
        : 0,
    }));
  },

  async submit(records: SubmitRecord[], teacherId: string) {
    const classLoadIds = [...new Set(records.map((r) => r.classLoadId))];
    for (const clId of classLoadIds) {
      const load = await ClassLoad.findOne({ _id: clId, teacherId, isActive: true }).lean();
      if (!load) {
        throw Object.assign(
          new Error(`Class load ${clId} not found or access denied`),
          { statusCode: 403 },
        );
      }
    }

    const results: ClientRecord[] = [];
    for (const rec of records) {
      const doc = await AttendanceRecord.findOneAndUpdate(
        {
          classLoadId: rec.classLoadId,
          studentId:   rec.studentId,
          date:        new Date(rec.date),
          session:     rec.session,
        },
        {
          $set: {
            status:     rec.status,
            syncStatus: 'synced',
            clientId:   rec.clientId ?? '',
            recordedBy: new mongoose.Types.ObjectId(teacherId),
          },
        },
        { upsert: true, new: true, setDefaultsOnInsert: true },
      ).lean();
      if (doc) results.push(toClientRecord(doc));
    }

    return results;
  },

  async update(id: string, status: string, teacherId: string) {
    const record = await AttendanceRecord.findById(id).lean();
    if (!record) throw Object.assign(new Error('Record not found'), { statusCode: 404 });

    const load = await ClassLoad.findOne({ _id: record.classLoadId, teacherId, isActive: true }).lean();
    if (!load) throw Object.assign(new Error('Access denied'), { statusCode: 403 });

    const updated = await AttendanceRecord.findByIdAndUpdate(
      id,
      { $set: { status, syncStatus: 'synced' } },
      { new: true },
    ).lean();

    if (!updated) throw Object.assign(new Error('Record not found'), { statusCode: 404 });
    return toClientRecord(updated);
  },

  async bulkSync(records: SubmitRecord[], teacherId: string) {
    return this.submit(records, teacherId);
  },
};
