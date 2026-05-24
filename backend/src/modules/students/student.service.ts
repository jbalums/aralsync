import mongoose from 'mongoose';
import { Student }           from '../../database/models/Student.model';
import { ClassLoad }         from '../../database/models/ClassLoad.model';
import { AttendanceRecord }  from '../../database/models/AttendanceRecord.model';
import { User }              from '../../database/models/User.model';
import { validateLRN }       from '../../shared/utils/lrn';

interface ListFilters {
  q?: string;
  classLoadId?: string;
  page: number;
  limit: number;
}

function toClientStudent(s: {
  _id: unknown;
  lrn: string;
  lastName: string;
  firstName: string;
  middleInitial: string;
  gender: string;
  birthday?: Date;
  sectionId: mongoose.Types.ObjectId;
  schoolId: mongoose.Types.ObjectId;
  guardian: { name: string; relationship: string; contactNumber: string };
}) {
  return {
    id:            (s._id as mongoose.Types.ObjectId).toString(),
    lrn:           s.lrn,
    sectionId:     s.sectionId.toString(),
    lastName:      s.lastName,
    firstName:     s.firstName,
    middleInitial: s.middleInitial,
    gender:        s.gender,
    birthday:      s.birthday?.toISOString().slice(0, 10),
    guardian:      s.guardian,
  };
}

export const studentService = {
  async listForTeacher(teacherId: string, filters: ListFilters) {
    // Resolve sectionIds from teacher's class loads
    let sectionIds: mongoose.Types.ObjectId[];

    if (filters.classLoadId) {
      const load = await ClassLoad.findOne({ _id: filters.classLoadId, teacherId, isActive: true }).lean();
      if (!load) return { students: [], total: 0, page: filters.page, pages: 0 };
      sectionIds = [load.sectionId];
    } else {
      const loads = await ClassLoad.find({ teacherId, isActive: true }, 'sectionId').lean();
      sectionIds = [...new Map(loads.map((l) => [l.sectionId.toString(), l.sectionId])).values()];
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query: Record<string, any> = {
      sectionId: { $in: sectionIds },
      isActive:  true,
    };

    if (filters.q) {
      const re = new RegExp(filters.q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      query.$or = [
        { lastName:  re },
        { firstName: re },
        { lrn:       { $regex: filters.q } },
      ];
    }

    const skip = (filters.page - 1) * filters.limit;
    const [students, total] = await Promise.all([
      Student.find(query).sort({ lastName: 1, firstName: 1 }).skip(skip).limit(filters.limit).lean(),
      Student.countDocuments(query),
    ]);

    return {
      students: students.map(toClientStudent),
      total,
      page:  filters.page,
      pages: Math.ceil(total / filters.limit),
    };
  },

  async getById(id: string, teacherId: string) {
    const loads = await ClassLoad.find({ teacherId, isActive: true }, 'sectionId').lean();
    const sectionIds = loads.map((l) => l.sectionId);

    const student = await Student.findOne({ _id: id, sectionId: { $in: sectionIds }, isActive: true }).lean();
    if (!student) return null;
    return toClientStudent(student);
  },

  async getByLRN(lrn: string, schoolId: string) {
    const student = await Student.findOne({ lrn, schoolId, isActive: true }).lean();
    if (!student) return null;
    return toClientStudent(student);
  },

  async create(dto: {
    lrn: string;
    lastName: string;
    firstName: string;
    middleInitial?: string;
    gender: 'M' | 'F';
    birthday?: string;
    classLoadId: string;
    guardian?: { name: string; relationship: string; contactNumber: string };
  }, teacherId: string) {
    if (!validateLRN(dto.lrn)) {
      throw Object.assign(new Error('Invalid LRN — check digit does not match'), { statusCode: 422 });
    }

    const load = await ClassLoad.findOne({ _id: dto.classLoadId, teacherId, isActive: true }).lean();
    if (!load) throw Object.assign(new Error('Class load not found'), { statusCode: 404 });

    const teacher = await User.findById(teacherId).lean();
    if (!teacher) throw Object.assign(new Error('Teacher not found'), { statusCode: 404 });

    const existing = await Student.findOne({ lrn: dto.lrn });
    if (existing) {
      throw Object.assign(new Error(`LRN ${dto.lrn} already exists`), { statusCode: 409 });
    }

    const student = await Student.create({
      lrn:           dto.lrn,
      lastName:      dto.lastName,
      firstName:     dto.firstName,
      middleInitial: dto.middleInitial ?? '',
      gender:        dto.gender,
      birthday:      dto.birthday ? new Date(dto.birthday) : undefined,
      sectionId:     load.sectionId,
      schoolId:      teacher.schoolId,
      guardian:      dto.guardian ?? { name: '', relationship: '', contactNumber: '' },
    });

    return toClientStudent(student.toObject());
  },

  async update(id: string, dto: {
    lastName?: string;
    firstName?: string;
    middleInitial?: string;
    gender?: 'M' | 'F';
    birthday?: string;
    guardian?: { name: string; relationship: string; contactNumber: string };
  }, teacherId: string) {
    const loads = await ClassLoad.find({ teacherId, isActive: true }, 'sectionId').lean();
    const sectionIds = loads.map((l) => l.sectionId);

    const student = await Student.findOne({ _id: id, sectionId: { $in: sectionIds }, isActive: true });
    if (!student) throw Object.assign(new Error('Student not found'), { statusCode: 404 });

    if (dto.lastName)      student.lastName      = dto.lastName;
    if (dto.firstName)     student.firstName     = dto.firstName;
    if (dto.middleInitial !== undefined) student.middleInitial = dto.middleInitial;
    if (dto.gender)        student.gender        = dto.gender;
    if (dto.birthday)      student.birthday      = new Date(dto.birthday);
    if (dto.guardian)      student.guardian      = dto.guardian;

    await student.save();
    return toClientStudent(student.toObject());
  },

  async deactivate(studentId: string, teacherId: string): Promise<boolean> {
    const loads = await ClassLoad.find({ teacherId, isActive: true }, 'sectionId').lean();
    const sectionIds = loads.map((l) => l.sectionId);

    const student = await Student.findOne({ _id: studentId, sectionId: { $in: sectionIds }, isActive: true });
    if (!student) throw Object.assign(new Error('Student not found or access denied'), { statusCode: 404 });

    await Student.findByIdAndUpdate(studentId, { isActive: false });
    return true;
  },

  async transfer(studentId: string, targetClassLoadId: string, teacherId: string) {
    const targetLoad = await ClassLoad.findOne({ _id: targetClassLoadId, isActive: true }).lean();
    if (!targetLoad) throw Object.assign(new Error('Target class load not found'), { statusCode: 404 });

    const loads = await ClassLoad.find({ teacherId, isActive: true }, 'sectionId').lean();
    const sectionIds = loads.map((l) => l.sectionId);

    const student = await Student.findOne({ _id: studentId, sectionId: { $in: sectionIds }, isActive: true });
    if (!student) throw Object.assign(new Error('Student not found'), { statusCode: 404 });

    student.sectionId = targetLoad.sectionId;
    await student.save();
    return toClientStudent(student.toObject());
  },

  async bulkImport(classLoadId: string, rows: Array<{
    lrn: string;
    lastName: string;
    firstName: string;
    middleInitial?: string;
    gender: 'M' | 'F';
    birthday?: string;
    guardian?: { name: string; relationship: string; contactNumber: string };
  }>, teacherId: string) {
    const load = await ClassLoad.findOne({ _id: classLoadId, teacherId, isActive: true }).lean();
    if (!load) throw Object.assign(new Error('Class load not found'), { statusCode: 404 });

    const teacher = await User.findById(teacherId).lean();
    if (!teacher) throw Object.assign(new Error('Teacher not found'), { statusCode: 404 });

    let created = 0;
    let updated = 0;
    const failed: { lrn: string; reason: string }[] = [];

    for (const row of rows) {
      if (!validateLRN(row.lrn)) {
        failed.push({ lrn: row.lrn, reason: 'Invalid LRN check digit' });
        continue;
      }

      try {
        const existing = await Student.findOne({ lrn: row.lrn });

        if (existing) {
          existing.lastName      = row.lastName;
          existing.firstName     = row.firstName;
          existing.middleInitial = row.middleInitial ?? '';
          existing.gender        = row.gender;
          if (row.birthday) existing.birthday = new Date(row.birthday);
          if (row.guardian) existing.guardian = row.guardian;
          // update section if moving to new section
          existing.sectionId = load.sectionId;
          await existing.save();
          updated++;
        } else {
          await Student.create({
            lrn:           row.lrn,
            lastName:      row.lastName,
            firstName:     row.firstName,
            middleInitial: row.middleInitial ?? '',
            gender:        row.gender,
            birthday:      row.birthday ? new Date(row.birthday) : undefined,
            sectionId:     load.sectionId,
            schoolId:      teacher.schoolId,
            guardian:      row.guardian ?? { name: '', relationship: '', contactNumber: '' },
          });
          created++;
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Unknown error';
        failed.push({ lrn: row.lrn, reason: msg });
      }
    }

    return { created, updated, failed };
  },

  async getAttendanceSummary(studentId: string, teacherId: string) {
    const loads = await ClassLoad.find({ teacherId, isActive: true }, 'sectionId _id').lean();
    const sectionIds = loads.map((l) => l.sectionId);

    const student = await Student.findOne({ _id: studentId, sectionId: { $in: sectionIds }, isActive: true }).lean();
    if (!student) return null;

    const classLoadIds = loads.map((l) => l._id);
    const records = await AttendanceRecord.find({
      studentId,
      classLoadId: { $in: classLoadIds },
    }).lean();

    const total   = records.length;
    const present = records.filter((r) => r.status === 'present').length;
    const late    = records.filter((r) => r.status === 'late').length;
    const absent  = records.filter((r) => r.status === 'absent').length;
    const excused = records.filter((r) => r.status === 'excused').length;
    const rate    = total > 0 ? Math.round(((present + late) / total) * 100) : 0;

    return { total, present, late, absent, excused, rate };
  },
};
