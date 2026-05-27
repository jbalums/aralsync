import mongoose from 'mongoose';
import { GradeEntry }    from '../../database/models/GradeEntry.model';
import { QuarterlyGrade } from '../../database/models/QuarterlyGrade.model';
import { ClassLoad }     from '../../database/models/ClassLoad.model';
import { Student }       from '../../database/models/Student.model';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toClientEntry(e: any) {
  return {
    id:          (e._id as mongoose.Types.ObjectId).toString(),
    classLoadId: e.classLoadId.toString(),
    studentId:   e.studentId.toString(),
    quarter:     e.quarter as string,
    component:   e.component as string,
    columnLabel: e.columnLabel as string,
    score:       e.score as number,
    maxScore:    e.maxScore as number,
    syncStatus:  e.syncStatus as string,
    updatedAt:   (e.updatedAt as Date).toISOString(),
  };
}

type BulkEntry = {
  studentId:   string;
  component:   string;
  columnLabel: string;
  maxScore:    number;
  score:       number;
  clientId?:   string;
};

const COMPONENT_ORDER: Record<string, number> = { WW: 0, PT: 1, QA: 2 };

export const gradeEntryService = {
  async getMatrix(classLoadId: string, quarter: string, teacherId: string) {
    const load = await ClassLoad.findOne({ _id: classLoadId, teacherId, isActive: true }).lean();
    if (!load) return null;

    const [students, entries, finalizedCheck] = await Promise.all([
      Student.find({ sectionId: load.sectionId, isActive: true })
        .sort({ lastName: 1, firstName: 1 })
        .lean(),
      GradeEntry.find({ classLoadId, quarter }).lean(),
      QuarterlyGrade.findOne({ classLoadId, quarter, isFinalized: true }).lean(),
    ]);

    // Build ordered column list from existing entries
    const columnMap = new Map<string, { id: string; component: string; columnLabel: string; maxScore: number }>();
    for (const e of entries) {
      const key = `${e.component}-${e.columnLabel}`;
      if (!columnMap.has(key)) {
        columnMap.set(key, { id: key, component: e.component, columnLabel: e.columnLabel, maxScore: e.maxScore });
      }
    }

    const columns = [...columnMap.values()].sort((a, b) => {
      const cmp = (COMPONENT_ORDER[a.component] ?? 9) - (COMPONENT_ORDER[b.component] ?? 9);
      return cmp !== 0 ? cmp : a.columnLabel.localeCompare(b.columnLabel);
    });

    const rows = students.map((student) => {
      const sId = student._id as mongoose.Types.ObjectId;
      const studentEntries = entries.filter((e) =>
        (e.studentId as mongoose.Types.ObjectId).equals(sId),
      );
      const scores: Record<string, { entryId: string | null; score: number | null }> = {};
      for (const col of columns) {
        const entry = studentEntries.find(
          (e) => e.component === col.component && e.columnLabel === col.columnLabel,
        );
        scores[col.id] = {
          entryId: entry ? (entry._id as mongoose.Types.ObjectId).toString() : null,
          score:   entry ? entry.score : null,
        };
      }
      return {
        student: {
          id:            sId.toString(),
          lastName:      student.lastName,
          firstName:     student.firstName,
          middleName: student.middleName,
          lrn:           student.lrn,
        },
        scores,
      };
    });

    return { columns, rows, weights: load.weights, isFinalized: Boolean(finalizedCheck) };
  },

  async bulkSave(classLoadId: string, quarter: string, entries: BulkEntry[], teacherId: string) {
    const load = await ClassLoad.findOne({ _id: classLoadId, teacherId, isActive: true }).lean();
    if (!load) throw Object.assign(new Error('Class load not found'), { statusCode: 404 });

    const finalized = await QuarterlyGrade.findOne({ classLoadId, quarter, isFinalized: true }).lean();
    if (finalized) {
      throw Object.assign(new Error('Quarter is finalized — no changes allowed'), { statusCode: 409 });
    }

    const results = [];
    for (const entry of entries) {
      const doc = await GradeEntry.findOneAndUpdate(
        { classLoadId, studentId: entry.studentId, quarter, component: entry.component, columnLabel: entry.columnLabel },
        { $set: { score: entry.score, maxScore: entry.maxScore, syncStatus: 'synced', clientId: entry.clientId ?? '' } },
        { upsert: true, new: true, setDefaultsOnInsert: true },
      ).lean();
      if (doc) results.push(toClientEntry(doc));
    }
    return results;
  },
};
