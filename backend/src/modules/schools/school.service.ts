import mongoose from 'mongoose';
import { School } from '../../database/models/School.model';
import { SchoolYear } from '../../database/models/SchoolYear.model';
import { User } from '../../database/models/User.model';
import { Section } from '../../database/models/Section.model';
import { ClassLoad } from '../../database/models/ClassLoad.model';
import { Subject } from '../../database/models/Subject.model';
import { Student } from '../../database/models/Student.model';
import { AttendanceRecord } from '../../database/models/AttendanceRecord.model';
import { QuarterlyGrade } from '../../database/models/QuarterlyGrade.model';
import { AuditLog } from '../../database/models/AuditLog.model';
import { Schedule } from '../../database/models/Schedule.model';
import { Role, Quarter } from '../../shared/types';

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
      .populate<{ subjectId: { _id: mongoose.Types.ObjectId; name: string; gradeLevel: number } }>('subjectId', 'name gradeLevel')
      .populate<{ sectionId: { _id: mongoose.Types.ObjectId; name: string; gradeLevel: number } }>('sectionId', 'name gradeLevel')
      .populate<{ teacherId: { _id: mongoose.Types.ObjectId; fullName: string } }>('teacherId', 'fullName')
      .lean();

    // Student count per section
    const studentAgg = await Student.aggregate<{ _id: mongoose.Types.ObjectId; count: number }>([
      { $match: { sectionId: { $in: sectionIds }, isActive: true } },
      { $group: { _id: '$sectionId', count: { $sum: 1 } } },
    ]);
    const studentCountMap = new Map(studentAgg.map((a) => [a._id.toString(), a.count]));

    return classLoads.map((cl) => {
      const subj = cl.subjectId as { _id: mongoose.Types.ObjectId; name: string; gradeLevel: number };
      const sect = cl.sectionId as { _id: mongoose.Types.ObjectId; name: string; gradeLevel: number };
      const teacher = cl.teacherId as { _id: mongoose.Types.ObjectId; fullName: string };
      return {
        id:           (cl._id as mongoose.Types.ObjectId).toString(),
        subject:      {
          id:         subj?._id?.toString() ?? '',
          name:       subj?.name ?? '',
          gradeLevel: subj?.gradeLevel ?? 0,
        },
        section:      {
          id:         sect?._id?.toString() ?? '',
          name:       sect?.name ?? '',
          gradeLevel: sect?.gradeLevel ?? 0,
        },
        teacher:      { id: teacher?._id?.toString() ?? '', name: teacher?.fullName ?? '' },
        quarter:      cl.quarter,
        roomNumber:   (cl as { roomNumber?: string }).roomNumber ?? '',
        weights:      (cl as { weights?: { ww: number; pt: number; qa: number } }).weights ?? { ww: 0.2, pt: 0.6, qa: 0.2 },
        schedule:     (cl as { schedule?: { dayOfWeek: number[]; timeStart: string; timeEnd: string } }).schedule ?? { dayOfWeek: [], timeStart: '', timeEnd: '' },
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

  async updateFacultyRole(
    schoolObjectId: string,
    userId: string,
    role: 'school_admin' | 'advisory_teacher' | 'subject_teacher',
  ) {
    const user = await User.findOne({ _id: userId, schoolId: schoolObjectId, isActive: true });
    if (!user) {
      throw Object.assign(new Error('Faculty member not found'), { statusCode: 404 });
    }
    if (user.role === Role.SUPER_ADMIN) {
      throw Object.assign(
        new Error('Cannot change role of a super admin from this endpoint'),
        { statusCode: 409 },
      );
    }
    user.role = role as Role;
    await user.save();

    const classCount = await ClassLoad.countDocuments({ teacherId: user._id, isActive: true });

    return {
      id:             (user._id as mongoose.Types.ObjectId).toString(),
      name:           user.fullName,
      email:          user.email,
      role:           user.role,
      department:     (user.department as string | undefined) ?? '',
      employeeNumber: user.employeeNumber ?? '',
      position:       user.position ?? '',
      classCount,
      lastSeenAt:     (user.lastSeenAt as Date | undefined)?.toISOString() ?? null,
    };
  },

  async assignClassLoad(schoolObjectId: string, userId: string, classLoadId: string) {
    const user = await User.findOne({ _id: userId, schoolId: schoolObjectId, isActive: true });
    if (!user) {
      throw Object.assign(new Error('Faculty member not found'), { statusCode: 404 });
    }

    const load = await ClassLoad.findById(classLoadId)
      .populate<{ sectionId: { _id: mongoose.Types.ObjectId; schoolId: mongoose.Types.ObjectId; name: string } }>(
        'sectionId',
        'schoolId name',
      );
    if (!load || !load.isActive) {
      throw Object.assign(new Error('Class load not found'), { statusCode: 404 });
    }

    const section = load.sectionId as unknown as {
      _id: mongoose.Types.ObjectId;
      schoolId: mongoose.Types.ObjectId;
      name: string;
    };
    if (section.schoolId.toString() !== schoolObjectId) {
      throw Object.assign(new Error('Class load does not belong to this school'), { statusCode: 403 });
    }

    const previousTeacherId = (load.teacherId as mongoose.Types.ObjectId).toString();
    const newTeacherId = (user._id as mongoose.Types.ObjectId).toString();

    if (previousTeacherId === newTeacherId) {
      return { classLoadId, teacherId: newTeacherId, previousTeacherId };
    }

    load.teacherId = user._id as mongoose.Types.ObjectId;
    await load.save();

    await Schedule.updateMany(
      { classLoadId: new mongoose.Types.ObjectId(classLoadId) },
      { $set: { teacherId: new mongoose.Types.ObjectId(newTeacherId) } },
    );

    return { classLoadId, teacherId: newTeacherId, previousTeacherId };
  },

  // ─── Admin class management ───────────────────────────

  async adminCreateClass(
    schoolObjectId: string,
    dto: {
      teacherId: string;
      subjectName: string;
      gradeLevel: number;
      sectionName: string;
      quarter: Quarter;
      roomNumber?: string;
      schedule?: { dayOfWeek: number[]; timeStart: string; timeEnd: string };
      slots?: Array<{ id?: string; dayOfWeek: number; timeStart: string; timeEnd: string; room?: string }>;
      weights: { ww: number; pt: number; qa: number };
    },
  ) {
    const teacher = await User.findOne({ _id: dto.teacherId, schoolId: schoolObjectId, isActive: true });
    if (!teacher) {
      throw Object.assign(new Error('Teacher not found in this school'), { statusCode: 404 });
    }
    if (![Role.ADVISORY_TEACHER, Role.SUBJECT_TEACHER, Role.SCHOOL_ADMIN].includes(teacher.role as Role)) {
      throw Object.assign(new Error('Selected user cannot be assigned as a class teacher'), { statusCode: 422 });
    }

    const activeYear = await SchoolYear.findOne({ schoolId: schoolObjectId, isActive: true });
    if (!activeYear) {
      throw Object.assign(
        new Error('No active school year found. Activate a school year first.'),
        { statusCode: 422 },
      );
    }

    let subject = await Subject.findOne({
      schoolId: schoolObjectId,
      name:       { $regex: new RegExp(`^${dto.subjectName}$`, 'i') },
      gradeLevel: dto.gradeLevel,
    });
    if (!subject) {
      subject = await Subject.create({
        schoolId:   schoolObjectId,
        name:       dto.subjectName,
        gradeLevel: dto.gradeLevel,
      });
    }

    let section = await Section.findOne({
      schoolId:     schoolObjectId,
      schoolYearId: activeYear._id,
      gradeLevel:   dto.gradeLevel,
      name:         { $regex: new RegExp(`^${dto.sectionName}$`, 'i') },
    });
    if (!section) {
      section = await Section.create({
        schoolId:     schoolObjectId,
        schoolYearId: activeYear._id,
        gradeLevel:   dto.gradeLevel,
        name:         dto.sectionName,
        adviserId:    teacher._id,
      });
    }

    const embeddedSchedule = (() => {
      if (dto.slots?.length) {
        const days = Array.from(new Set(dto.slots.map((s) => s.dayOfWeek))).sort((a, b) => a - b);
        const starts = dto.slots.map((s) => {
          const [h = 0, m = 0] = s.timeStart.split(':').map(Number);
          return h * 60 + m;
        });
        const ends = dto.slots.map((s) => {
          const [h = 0, m = 0] = s.timeEnd.split(':').map(Number);
          return h * 60 + m;
        });
        const minS = Math.min(...starts);
        const maxE = Math.max(...ends);
        const pad = (n: number) => n.toString().padStart(2, '0');
        return {
          dayOfWeek: days,
          timeStart: `${pad(Math.floor(minS / 60))}:${pad(minS % 60)}`,
          timeEnd:   `${pad(Math.floor(maxE / 60))}:${pad(maxE % 60)}`,
        };
      }
      return dto.schedule ?? { dayOfWeek: [], timeStart: '', timeEnd: '' };
    })();

    const load = await ClassLoad.create({
      teacherId:    teacher._id,
      subjectId:    subject._id,
      sectionId:    section._id,
      schoolYearId: activeYear._id,
      quarter:      dto.quarter,
      roomNumber:   dto.roomNumber ?? '',
      schedule:     embeddedSchedule,
      weights:      dto.weights,
    });

    return {
      id:        (load._id as mongoose.Types.ObjectId).toString(),
      teacherId: teacher._id.toString(),
      teacherName: teacher.fullName,
      subjectName: subject.name,
      sectionName: section.name,
      gradeLevel:  section.gradeLevel,
    };
  },

  async adminUpdateClass(
    schoolObjectId: string,
    classId: string,
    dto: {
      roomNumber?: string;
      quarter?:    Quarter;
      schedule?:   { dayOfWeek: number[]; timeStart: string; timeEnd: string };
      slots?:      Array<{ id?: string; dayOfWeek: number; timeStart: string; timeEnd: string; room?: string }>;
      weights?:    { ww: number; pt: number; qa: number };
    },
  ) {
    const load = await ClassLoad.findOne({ _id: classId, isActive: true })
      .populate<{ subjectId: { name: string } }>('subjectId', 'name')
      .populate<{ sectionId: { _id: mongoose.Types.ObjectId; name: string; schoolId: mongoose.Types.ObjectId } }>('sectionId', 'name schoolId');

    if (!load) {
      throw Object.assign(new Error('Class load not found'), { statusCode: 404 });
    }

    const section = load.sectionId as unknown as { schoolId: mongoose.Types.ObjectId; name: string };
    if (section.schoolId.toString() !== schoolObjectId) {
      throw Object.assign(new Error('Class load not in this school'), { statusCode: 403 });
    }

    if (dto.roomNumber !== undefined) load.roomNumber = dto.roomNumber;
    if (dto.quarter    !== undefined) load.quarter    = dto.quarter;
    if (dto.weights    !== undefined) load.weights    = dto.weights;

    if (dto.slots !== undefined) {
      if (dto.slots.length) {
        const days = Array.from(new Set(dto.slots.map((s) => s.dayOfWeek))).sort((a, b) => a - b);
        const starts = dto.slots.map((s) => {
          const [h = 0, m = 0] = s.timeStart.split(':').map(Number);
          return h * 60 + m;
        });
        const ends = dto.slots.map((s) => {
          const [h = 0, m = 0] = s.timeEnd.split(':').map(Number);
          return h * 60 + m;
        });
        const minS = Math.min(...starts);
        const maxE = Math.max(...ends);
        const pad = (n: number) => n.toString().padStart(2, '0');
        load.schedule = {
          dayOfWeek: days,
          timeStart: `${pad(Math.floor(minS / 60))}:${pad(minS % 60)}`,
          timeEnd:   `${pad(Math.floor(maxE / 60))}:${pad(maxE % 60)}`,
        };
      } else {
        load.schedule = { dayOfWeek: [], timeStart: '', timeEnd: '' };
      }
    } else if (dto.schedule !== undefined) {
      load.schedule = dto.schedule;
    }

    await load.save();

    const subj = load.subjectId as unknown as { name: string };
    return {
      id:          (load._id as mongoose.Types.ObjectId).toString(),
      subjectName: subj.name,
      sectionName: section.name,
    };
  },

  async adminAssignTeacher(schoolObjectId: string, classId: string, newTeacherId: string) {
    const load = await ClassLoad.findOne({ _id: classId, isActive: true })
      .populate<{ subjectId: { name: string } }>('subjectId', 'name')
      .populate<{ sectionId: { _id: mongoose.Types.ObjectId; name: string; schoolId: mongoose.Types.ObjectId } }>('sectionId', 'name schoolId');

    if (!load) {
      throw Object.assign(new Error('Class load not found'), { statusCode: 404 });
    }

    const section = load.sectionId as unknown as { schoolId: mongoose.Types.ObjectId; name: string };
    if (section.schoolId.toString() !== schoolObjectId) {
      throw Object.assign(new Error('Class load not in this school'), { statusCode: 403 });
    }

    const teacher = await User.findOne({ _id: newTeacherId, schoolId: schoolObjectId, isActive: true });
    if (!teacher) {
      throw Object.assign(new Error('Teacher not found in this school'), { statusCode: 404 });
    }
    if (![Role.ADVISORY_TEACHER, Role.SUBJECT_TEACHER, Role.SCHOOL_ADMIN].includes(teacher.role as Role)) {
      throw Object.assign(new Error('Selected user cannot be assigned as a class teacher'), { statusCode: 422 });
    }

    const previousTeacherId = load.teacherId.toString();
    load.teacherId = teacher._id as mongoose.Types.ObjectId;
    await load.save();

    // keep any Schedule rows aligned with the new teacher
    await Schedule.updateMany(
      { classLoadId: load._id },
      { $set: { teacherId: teacher._id } },
    );

    const subj = load.subjectId as unknown as { name: string };
    return {
      id:                (load._id as mongoose.Types.ObjectId).toString(),
      teacherId:         teacher._id.toString(),
      teacherName:       teacher.fullName,
      previousTeacherId,
      subjectName:       subj.name,
      sectionName:       section.name,
    };
  },

  async adminDeleteClass(schoolObjectId: string, classId: string) {
    const load = await ClassLoad.findOne({ _id: classId, isActive: true })
      .populate<{ subjectId: { name: string } }>('subjectId', 'name')
      .populate<{ sectionId: { _id: mongoose.Types.ObjectId; name: string; schoolId: mongoose.Types.ObjectId } }>('sectionId', 'name schoolId');

    if (!load) {
      throw Object.assign(new Error('Class load not found'), { statusCode: 404 });
    }

    const section = load.sectionId as unknown as { schoolId: mongoose.Types.ObjectId; name: string };
    if (section.schoolId.toString() !== schoolObjectId) {
      throw Object.assign(new Error('Class load not in this school'), { statusCode: 403 });
    }

    load.isActive = false;
    await load.save();

    const subj = load.subjectId as unknown as { name: string };
    return {
      id:          (load._id as mongoose.Types.ObjectId).toString(),
      subjectName: subj.name,
      sectionName: section.name,
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
