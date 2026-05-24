import mongoose from 'mongoose';
import { School } from '../../database/models/School.model';
import { SchoolYear } from '../../database/models/SchoolYear.model';
import { User } from '../../database/models/User.model';
import { Section } from '../../database/models/Section.model';
import { ClassLoad } from '../../database/models/ClassLoad.model';
import { Student } from '../../database/models/Student.model';
import { AttendanceRecord } from '../../database/models/AttendanceRecord.model';
import { QuarterlyGrade } from '../../database/models/QuarterlyGrade.model';
import { AuditLog } from '../../database/models/AuditLog.model';
import { Role } from '../../shared/types';

function mapSchool(s: InstanceType<typeof School> & { _id: unknown }) {
  return {
    id: (s._id as mongoose.Types.ObjectId).toString(),
    name: s.name,
    schoolId: s.schoolId,
    division: s.division,
    district: s.district ?? '',
    address: s.address ?? '',
    isActive: s.isActive,
  };
}

export const schoolService = {
  async listAll() {
    const schools = await School.find({}).sort({ name: 1 }).lean();
    return schools.map((s) => ({
      id: (s._id as mongoose.Types.ObjectId).toString(),
      name: s.name,
      schoolId: s.schoolId,
      division: s.division,
      district: s.district ?? '',
      address: s.address ?? '',
      isActive: s.isActive,
    }));
  },

  async createSchool(data: {
    name: string;
    schoolId: string;
    division: string;
    district?: string;
    address?: string;
  }) {
    const existing = await School.findOne({ schoolId: data.schoolId });
    if (existing) {
      throw Object.assign(
        new Error(`School with DepEd ID "${data.schoolId}" already exists`),
        { statusCode: 409 },
      );
    }
    const school = await School.create(data);
    return mapSchool(school);
  },

  async updateSchool(
    id: string,
    data: Partial<{ name: string; schoolId: string; division: string; district: string; address: string }>,
  ) {
    const school = await School.findByIdAndUpdate(id, { $set: data }, { new: true });
    if (!school) {
      throw Object.assign(new Error('School not found'), { statusCode: 404 });
    }
    return mapSchool(school);
  },

  async bulkCreateSchools(data: {
    division: string;
    district?: string;
    schools: Array<{ schoolId: string; name: string; address?: string }>;
  }) {
    const ids = data.schools.map((s) => s.schoolId);
    const existing = await School.find({ schoolId: { $in: ids } }, { schoolId: 1 }).lean();
    const existingSet = new Set(existing.map((e) => e.schoolId));

    const skipped: Array<{ schoolId: string; name: string; reason: string }> = [];
    const failed: Array<{ schoolId: string; name: string; reason: string }> = [];
    const toInsert: Array<{
      schoolId: string;
      name: string;
      address: string;
      division: string;
      district: string;
    }> = [];

    const seenInBatch = new Set<string>();
    for (const row of data.schools) {
      if (existingSet.has(row.schoolId)) {
        skipped.push({
          schoolId: row.schoolId,
          name: row.name,
          reason: 'DepEd ID already exists',
        });
        continue;
      }
      if (seenInBatch.has(row.schoolId)) {
        skipped.push({
          schoolId: row.schoolId,
          name: row.name,
          reason: 'Duplicate row in CSV',
        });
        continue;
      }
      seenInBatch.add(row.schoolId);
      toInsert.push({
        schoolId: row.schoolId,
        name: row.name,
        address: row.address ?? '',
        division: data.division,
        district: data.district ?? '',
      });
    }

    let created = 0;
    if (toInsert.length > 0) {
      try {
        const inserted = await School.insertMany(toInsert, { ordered: false });
        created = inserted.length;
      } catch (err) {
        const e = err as { insertedDocs?: unknown[]; writeErrors?: Array<{ index: number; errmsg?: string }> };
        created = e.insertedDocs?.length ?? 0;
        for (const we of e.writeErrors ?? []) {
          const row = toInsert[we.index];
          if (row) {
            failed.push({
              schoolId: row.schoolId,
              name: row.name,
              reason: we.errmsg ?? 'Insert failed',
            });
          }
        }
      }
    }

    return { created, skipped, failed };
  },


  async getById(id: string) {
    const school = await School.findById(id).lean();
    if (!school) {
      throw Object.assign(new Error('School not found'), { statusCode: 404 });
    }
    return {
      id:       (school._id as mongoose.Types.ObjectId).toString(),
      name:     school.name,
      schoolId: school.schoolId,
      division: school.division,
      district: school.district ?? '',
      address:  school.address ?? '',
      isActive: school.isActive,
    };
  },

  async updateInfo(
    id: string,
    data: { division?: string; district?: string; address?: string },
  ) {
    const school = await School.findByIdAndUpdate(id, { $set: data }, { new: true });
    if (!school) {
      throw Object.assign(new Error('School not found'), { statusCode: 404 });
    }
    return mapSchool(school);
  },

  async getYears(schoolObjectId: string) {
    const years = await SchoolYear.find({ schoolId: schoolObjectId })
      .sort({ startDate: -1 })
      .lean();

    return years.map((y) => ({
      id: (y._id as mongoose.Types.ObjectId).toString(),
      schoolId: y.schoolId.toString(),
      label: y.label,
      startDate: y.startDate.toISOString().slice(0, 10),
      endDate: y.endDate.toISOString().slice(0, 10),
      isActive: y.isActive,
    }));
  },

  async createYear(
    schoolObjectId: string,
    data: { label: string; startDate: string; endDate: string },
  ) {
    const school = await School.findById(schoolObjectId);
    if (!school) {
      throw Object.assign(new Error('School not found'), { statusCode: 404 });
    }

    const year = await SchoolYear.create({
      schoolId: schoolObjectId,
      label: data.label,
      startDate: new Date(data.startDate),
      endDate: new Date(data.endDate),
      isActive: false,
    });

    return {
      id: (year._id as mongoose.Types.ObjectId).toString(),
      schoolId: year.schoolId.toString(),
      label: year.label,
      startDate: year.startDate.toISOString().slice(0, 10),
      endDate: year.endDate.toISOString().slice(0, 10),
      isActive: year.isActive,
    };
  },

  async updateYear(
    schoolObjectId: string,
    yearId: string,
    data: { label?: string; startDate?: string; endDate?: string },
  ) {
    const year = await SchoolYear.findOne({ _id: yearId, schoolId: schoolObjectId });
    if (!year) {
      throw Object.assign(new Error('School year not found'), { statusCode: 404 });
    }
    if (data.label     !== undefined) year.label     = data.label;
    if (data.startDate !== undefined) year.startDate = new Date(data.startDate);
    if (data.endDate   !== undefined) year.endDate   = new Date(data.endDate);
    await year.save();
    return {
      id:        (year._id as mongoose.Types.ObjectId).toString(),
      schoolId:  year.schoolId.toString(),
      label:     year.label,
      startDate: year.startDate.toISOString().slice(0, 10),
      endDate:   year.endDate.toISOString().slice(0, 10),
      isActive:  year.isActive,
    };
  },

  async deleteYear(schoolObjectId: string, yearId: string) {
    const year = await SchoolYear.findOne({ _id: yearId, schoolId: schoolObjectId });
    if (!year) {
      throw Object.assign(new Error('School year not found'), { statusCode: 404 });
    }
    if (year.isActive) {
      throw Object.assign(
        new Error('Cannot delete the active school year'),
        { statusCode: 409 },
      );
    }
    await year.deleteOne();
    return { id: yearId };
  },

  async getAdminSummary(schoolObjectId: string) {
    const [sections, facultyCount, studentCount, activeYear] = await Promise.all([
      Section.find({ schoolId: schoolObjectId, isActive: true }).lean(),
      User.countDocuments({ schoolId: schoolObjectId, isActive: true, role: { $ne: Role.SUPER_ADMIN } }),
      Student.countDocuments({ schoolId: schoolObjectId, isActive: true }),
      SchoolYear.findOne({ schoolId: schoolObjectId, isActive: true }).lean(),
    ]);

    const sectionIds = sections.map((s) => s._id);
    const sectionCount = sections.length;

    const classLoads = activeYear
      ? await ClassLoad.find({ sectionId: { $in: sectionIds }, schoolYearId: activeYear._id, isActive: true }).lean()
      : [];
    const classCount = classLoads.length;
    const classLoadIds = classLoads.map((cl) => cl._id);

    // School-wide attendance rate (last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const [attAgg] = await AttendanceRecord.aggregate<{ total: number; present: number }>([
      { $match: { classLoadId: { $in: classLoadIds }, date: { $gte: thirtyDaysAgo } } },
      {
        $group: {
          _id: null,
          total:   { $sum: 1 },
          present: { $sum: { $cond: [{ $in: ['$status', ['present', 'late']] }, 1, 0] } },
        },
      },
    ]);
    const schoolAvgAttendance = attAgg
      ? Math.round((attAgg.present / attAgg.total) * 1000) / 10
      : 0;

    // Attendance by department
    const teachers = await User.find({
      schoolId: schoolObjectId,
      isActive: true,
      role: { $ne: Role.SUPER_ADMIN },
    }).lean();
    const teacherDeptMap = new Map(
      teachers.map((t) => [t._id.toString(), (t.department as string | undefined) || 'Other']),
    );
    const clTeacherMap = new Map(
      classLoads.map((cl) => [
        (cl._id as mongoose.Types.ObjectId).toString(),
        (cl.teacherId as mongoose.Types.ObjectId).toString(),
      ]),
    );

    const attRecords = await AttendanceRecord.find({
      classLoadId: { $in: classLoadIds },
      date: { $gte: thirtyDaysAgo },
    }).lean();

    const deptStats = new Map<string, { present: number; total: number; students: Set<string> }>();
    for (const rec of attRecords) {
      const tid = clTeacherMap.get((rec.classLoadId as mongoose.Types.ObjectId).toString());
      const dept = tid ? (teacherDeptMap.get(tid) ?? 'Other') : 'Other';
      if (!deptStats.has(dept)) deptStats.set(dept, { present: 0, total: 0, students: new Set() });
      const s = deptStats.get(dept)!;
      s.total++;
      s.students.add((rec.studentId as mongoose.Types.ObjectId).toString());
      if (rec.status === 'present' || rec.status === 'late') s.present++;
    }
    const attendanceByDept = Array.from(deptStats.entries()).map(([dept, s]) => ({
      dept,
      rate: s.total > 0 ? Math.round((s.present / s.total) * 1000) / 10 : 0,
      studentCount: s.students.size,
    }));

    // Grade distribution
    const grades = classLoadIds.length
      ? await QuarterlyGrade.find({ classLoadId: { $in: classLoadIds } }).lean()
      : [];
    const gradeDistribution = { highestHonors: 0, highHonors: 0, honors: 0, passing: 0, needsHelp: 0 };
    for (const g of grades) {
      const t = g.transmutedGrade ?? 0;
      if (t >= 98) gradeDistribution.highestHonors++;
      else if (t >= 95) gradeDistribution.highHonors++;
      else if (t >= 90) gradeDistribution.honors++;
      else if (t >= 75) gradeDistribution.passing++;
      else gradeDistribution.needsHelp++;
    }

    return {
      facultyCount,
      studentCount,
      sectionCount,
      classCount,
      schoolAvgAttendance,
      attendanceByDept,
      gradeDistribution,
    };
  },

  async getFaculty(schoolObjectId: string) {
    const teachers = await User.find({
      schoolId: schoolObjectId,
      isActive: true,
      role: { $ne: Role.SUPER_ADMIN },
    })
      .sort({ fullName: 1 })
      .lean();

    if (!teachers.length) return [];

    const teacherIds = teachers.map((t) => t._id);
    const classLoads = await ClassLoad.find({
      teacherId: { $in: teacherIds },
      isActive: true,
    }).lean();

    const classCountMap = new Map<string, number>();
    for (const cl of classLoads) {
      const tid = (cl.teacherId as mongoose.Types.ObjectId).toString();
      classCountMap.set(tid, (classCountMap.get(tid) ?? 0) + 1);
    }

    return teachers.map((t) => ({
      id:             (t._id as mongoose.Types.ObjectId).toString(),
      name:           t.fullName,
      email:          t.email,
      role:           t.role,
      department:     (t.department as string | undefined) ?? '',
      employeeNumber: t.employeeNumber ?? '',
      position:       t.position ?? '',
      classCount:     classCountMap.get((t._id as mongoose.Types.ObjectId).toString()) ?? 0,
      lastSeenAt:     (t.lastSeenAt as Date | undefined)?.toISOString() ?? null,
    }));
  },

  async getAllClasses(schoolObjectId: string) {
    const [sections, activeYear] = await Promise.all([
      Section.find({ schoolId: schoolObjectId, isActive: true }).lean(),
      SchoolYear.findOne({ schoolId: schoolObjectId, isActive: true }).lean(),
    ]);

    if (!sections.length || !activeYear) return [];

    const sectionIds = sections.map((s) => s._id);

    const classLoads = await ClassLoad.find({
      sectionId: { $in: sectionIds },
      schoolYearId: activeYear._id,
      isActive: true,
    })
      .populate<{ subjectId: { _id: mongoose.Types.ObjectId; name: string; gradeLevel: string } }>('subjectId', 'name gradeLevel')
      .populate<{ sectionId: { _id: mongoose.Types.ObjectId; name: string; gradeLevel: string } }>('sectionId', 'name gradeLevel')
      .populate<{ teacherId: { _id: mongoose.Types.ObjectId; fullName: string } }>('teacherId', 'fullName')
      .lean();

    // Student count per section
    const studentAgg = await Student.aggregate<{ _id: mongoose.Types.ObjectId; count: number }>([
      { $match: { sectionId: { $in: sectionIds }, isActive: true } },
      { $group: { _id: '$sectionId', count: { $sum: 1 } } },
    ]);
    const studentCountMap = new Map(studentAgg.map((a) => [a._id.toString(), a.count]));

    return classLoads.map((cl) => {
      const subj = cl.subjectId as { _id: mongoose.Types.ObjectId; name: string; gradeLevel: string };
      const sect = cl.sectionId as { _id: mongoose.Types.ObjectId; name: string; gradeLevel: string };
      const teacher = cl.teacherId as { _id: mongoose.Types.ObjectId; fullName: string };
      return {
        id:           (cl._id as mongoose.Types.ObjectId).toString(),
        subject:      { name: subj?.name ?? '', gradeLevel: subj?.gradeLevel ?? '' },
        section:      { name: sect?.name ?? '', gradeLevel: sect?.gradeLevel ?? '' },
        teacher:      { id: teacher?._id?.toString() ?? '', name: teacher?.fullName ?? '' },
        quarter:      cl.quarter,
        studentCount: studentCountMap.get(sect?._id?.toString() ?? '') ?? 0,
      };
    });
  },

  async getAuditLog(schoolObjectId: string, limit = 50) {
    const entries = await AuditLog.find({ schoolId: schoolObjectId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    return entries.map((e) => ({
      id:        (e._id as mongoose.Types.ObjectId).toString(),
      actorName: e.actorName,
      action:    e.action,
      target:    e.target,
      tone:      e.tone,
      createdAt: (e.createdAt as Date).toISOString(),
    }));
  },

  async updateFacultyMember(
    schoolObjectId: string,
    userId: string,
    data: { department?: string; position?: string },
  ) {
    const user = await User.findOne({ _id: userId, schoolId: schoolObjectId, isActive: true });
    if (!user) {
      throw Object.assign(new Error('Faculty member not found'), { statusCode: 404 });
    }
    if (data.department !== undefined) user.department = data.department;
    if (data.position   !== undefined) user.position   = data.position;
    await user.save();
    return {
      id:         (user._id as mongoose.Types.ObjectId).toString(),
      name:       user.fullName,
      email:      user.email,
      role:       user.role,
      department: user.department ?? '',
      position:   user.position ?? '',
    };
  },

  async activateYear(schoolObjectId: string, yearId: string) {
    const year = await SchoolYear.findOne({ _id: yearId, schoolId: schoolObjectId });
    if (!year) {
      throw Object.assign(new Error('School year not found'), { statusCode: 404 });
    }

    // deactivate all others for this school first
    await SchoolYear.updateMany({ schoolId: schoolObjectId }, { isActive: false });

    year.isActive = true;
    await year.save();

    return {
      id: (year._id as mongoose.Types.ObjectId).toString(),
      schoolId: year.schoolId.toString(),
      label: year.label,
      startDate: year.startDate.toISOString().slice(0, 10),
      endDate: year.endDate.toISOString().slice(0, 10),
      isActive: year.isActive,
    };
  },
};
