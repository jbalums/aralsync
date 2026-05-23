import mongoose from 'mongoose';
import { QuarterlyGrade } from '../../database/models/QuarterlyGrade.model';
import { GradeEntry }     from '../../database/models/GradeEntry.model';
import { ClassLoad }      from '../../database/models/ClassLoad.model';
import { Student }        from '../../database/models/Student.model';
import { computeQuarterlyGrade } from '../../shared/utils/gradeCompute';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toClientGrade(g: any) {
  return {
    id:             (g._id as mongoose.Types.ObjectId).toString(),
    classLoadId:    g.classLoadId.toString(),
    studentId:      g.studentId.toString(),
    quarter:        g.quarter as string,
    wwWeighted:     g.wwWeighted as number,
    ptWeighted:     g.ptWeighted as number,
    qaWeighted:     g.qaWeighted as number,
    initialGrade:   g.initialGrade as number,
    transmutedGrade: g.transmutedGrade as number,
    isFinalized:    g.isFinalized as boolean,
    syncStatus:     g.syncStatus as string,
    updatedAt:      (g.updatedAt as Date).toISOString(),
  };
}

function classifyHonors(grade: number): string | null {
  if (grade >= 98) return 'withHighestHonors';
  if (grade >= 95) return 'withHighHonors';
  if (grade >= 90) return 'withHonors';
  return null;
}

export const quarterlyGradeService = {
  async get(classLoadId: string, quarter: string, teacherId: string) {
    const load = await ClassLoad.findOne({ _id: classLoadId, teacherId, isActive: true }).lean();
    if (!load) return null;

    const grades = await QuarterlyGrade.find({ classLoadId, quarter }).lean();
    return grades.map(toClientGrade);
  },

  async compute(classLoadId: string, quarter: string, teacherId: string) {
    const load = await ClassLoad.findOne({ _id: classLoadId, teacherId, isActive: true }).lean();
    if (!load) throw Object.assign(new Error('Class load not found'), { statusCode: 404 });

    const [students, entries] = await Promise.all([
      Student.find({ sectionId: load.sectionId, isActive: true }).lean(),
      GradeEntry.find({ classLoadId, quarter }).lean(),
    ]);

    const results = [];
    for (const student of students) {
      const sId = student._id as mongoose.Types.ObjectId;
      const sEntries = entries.filter((e) =>
        (e.studentId as mongoose.Types.ObjectId).equals(sId),
      );

      const wwScores = sEntries.filter((e) => e.component === 'WW').map((e) => ({ score: e.score, max: e.maxScore }));
      const ptScores = sEntries.filter((e) => e.component === 'PT').map((e) => ({ score: e.score, max: e.maxScore }));
      const qaEntries = sEntries.filter((e) => e.component === 'QA');
      const qa = qaEntries.length ? { score: qaEntries[0].score, max: qaEntries[0].maxScore } : { score: 0, max: 1 };

      const computed = computeQuarterlyGrade(wwScores, ptScores, qa, load.weights);

      const doc = await QuarterlyGrade.findOneAndUpdate(
        { classLoadId, studentId: sId, quarter },
        { $set: { ...computed, syncStatus: 'synced', isFinalized: false } },
        { upsert: true, new: true, setDefaultsOnInsert: true },
      ).lean();
      if (doc) results.push(toClientGrade(doc));
    }

    return results;
  },

  async finalize(classLoadId: string, quarter: string, teacherId: string) {
    const load = await ClassLoad.findOne({ _id: classLoadId, teacherId, isActive: true }).lean();
    if (!load) throw Object.assign(new Error('Class load not found'), { statusCode: 404 });

    const result = await QuarterlyGrade.updateMany(
      { classLoadId, quarter },
      { $set: { isFinalized: true } },
    );
    return { finalized: result.modifiedCount };
  },

  async getClassReport(classLoadId: string, quarter: string, teacherId: string) {
    const load = await ClassLoad.findOne({ _id: classLoadId, teacherId, isActive: true }).lean();
    if (!load) return null;

    const [grades, students] = await Promise.all([
      QuarterlyGrade.find({ classLoadId, quarter }).lean(),
      Student.find({ sectionId: load.sectionId, isActive: true }).lean(),
    ]);

    const rows = grades
      .map((g) => {
        const student = students.find((s) =>
          (s._id as mongoose.Types.ObjectId).equals(g.studentId as mongoose.Types.ObjectId),
        );
        if (!student) return null;
        return {
          student: {
            id:        (student._id as mongoose.Types.ObjectId).toString(),
            lastName:  student.lastName,
            firstName: student.firstName,
            lrn:       student.lrn,
          },
          transmutedGrade: g.transmutedGrade,
          initialGrade:    g.initialGrade,
          wwWeighted:      g.wwWeighted,
          ptWeighted:      g.ptWeighted,
          qaWeighted:      g.qaWeighted,
          classification:  classifyHonors(g.transmutedGrade),
        };
      })
      .filter(Boolean)
      .sort((a, b) => b!.transmutedGrade - a!.transmutedGrade)
      .map((r, i) => ({ ...r!, rank: i + 1 }));

    const gradeNums = rows.map((r) => r.transmutedGrade);
    const classAvg  = gradeNums.length ? gradeNums.reduce((a, b) => a + b, 0) / gradeNums.length : 0;
    const passing   = gradeNums.filter((g) => g >= 75).length;

    return {
      rows,
      stats: {
        classAvg:          Math.round(classAvg * 100) / 100,
        passing,
        passingPct:        gradeNums.length ? Math.round((passing / gradeNums.length) * 100) : 0,
        withHonors:        rows.filter((r) => r.classification === 'withHonors').length,
        withHighHonors:    rows.filter((r) => r.classification === 'withHighHonors').length,
        withHighestHonors: rows.filter((r) => r.classification === 'withHighestHonors').length,
      },
    };
  },
};
