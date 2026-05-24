import mongoose from 'mongoose';
import { ClassLoad } from '../../database/models/ClassLoad.model';
import { Student } from '../../database/models/Student.model';
import { Subject } from '../../database/models/Subject.model';
import { Section } from '../../database/models/Section.model';
import { SchoolYear } from '../../database/models/SchoolYear.model';
import { User } from '../../database/models/User.model';
import { Schedule } from '../../database/models/Schedule.model';
import { Quarter } from '../../shared/types';

interface UpdateClassLoadDto {
  roomNumber?: string;
  quarter?: Quarter;
  schedule?: { dayOfWeek: number[]; timeStart: string; timeEnd: string };
  weights?: { ww: number; pt: number; qa: number };
}

interface CreateClassLoadDto {
  subjectName: string;
  gradeLevel: number;
  sectionName: string;
  quarter: Quarter;
  roomNumber?: string;
  schedule?: { dayOfWeek: number[]; timeStart: string; timeEnd: string };
  weights: { ww: number; pt: number; qa: number };
}

function formatScheduleTime(schedule: {
  dayOfWeek: number[];
  timeStart: string;
  timeEnd: string;
}): string {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const dayStr = schedule.dayOfWeek.map((d) => days[d] ?? '').join('/');
  if (!dayStr || !schedule.timeStart) return '';
  return `${dayStr} ${schedule.timeStart}–${schedule.timeEnd}`.trim();
}

function toListItem(
  load: {
    _id: unknown;
    teacherId: mongoose.Types.ObjectId;
    subjectId: unknown;
    sectionId: unknown;
    schoolYearId: mongoose.Types.ObjectId;
    quarter: string;
    roomNumber: string;
    schedule: { dayOfWeek: number[]; timeStart: string; timeEnd: string };
    weights: { ww: number; pt: number; qa: number };
  },
  studentCount: number,
) {
  const subject = load.subjectId as {
    _id: mongoose.Types.ObjectId;
    name: string;
    gradeLevel: number;
  };
  const section = load.sectionId as {
    _id: mongoose.Types.ObjectId;
    name: string;
    gradeLevel: number;
  };

  return {
    id: (load._id as mongoose.Types.ObjectId).toString(),
    teacherId: load.teacherId.toString(),
    subjectId: subject._id.toString(),
    sectionId: section._id.toString(),
    schoolYearId: load.schoolYearId.toString(),
    quarter: load.quarter,
    roomNumber: load.roomNumber,
    scheduleTime: formatScheduleTime(load.schedule),
    wwWeight: load.weights.ww,
    ptWeight: load.weights.pt,
    qaWeight: load.weights.qa,
    subject: {
      id: subject._id.toString(),
      name: subject.name,
      gradeLevel: `Grade ${subject.gradeLevel}`,
    },
    section: {
      id: section._id.toString(),
      name: section.name,
      gradeLevel: `Grade ${section.gradeLevel}`,
    },
    studentCount,
  };
}

export const classLoadService = {
  async listForTeacher(teacherId: string) {
    const loads = await ClassLoad.find({ teacherId, isActive: true })
      .populate('subjectId', 'name gradeLevel')
      .populate('sectionId', 'name gradeLevel')
      .lean();

    const sectionIds = loads.map((l) => l.sectionId);
    const counts = await Student.aggregate<{ _id: mongoose.Types.ObjectId; count: number }>([
      { $match: { sectionId: { $in: sectionIds }, isActive: true } },
      { $group: { _id: '$sectionId', count: { $sum: 1 } } },
    ]);
    const countMap = new Map(counts.map((c) => [c._id.toString(), c.count]));

    return loads.map((load) =>
      toListItem(load as Parameters<typeof toListItem>[0], countMap.get(load.sectionId.toString()) ?? 0),
    );
  },

  async getById(id: string, teacherId: string) {
    const load = await ClassLoad.findOne({ _id: id, teacherId, isActive: true })
      .populate('subjectId', 'name gradeLevel')
      .populate('sectionId', 'name gradeLevel')
      .lean();

    if (!load) return null;

    const studentCount = await Student.countDocuments({
      sectionId: load.sectionId,
      isActive: true,
    });

    const item = toListItem(load as Parameters<typeof toListItem>[0], studentCount);
    return { ...item, schedule: load.schedule };
  },

  async getStudents(classLoadId: string, teacherId: string) {
    const load = await ClassLoad.findOne({ _id: classLoadId, teacherId, isActive: true }).lean();
    if (!load) return null;

    const students = await Student.find({ sectionId: load.sectionId, isActive: true })
      .sort({ lastName: 1, firstName: 1 })
      .lean();

    return students.map((s) => ({
      id: (s._id as mongoose.Types.ObjectId).toString(),
      lrn: s.lrn,
      sectionId: s.sectionId.toString(),
      lastName: s.lastName,
      firstName: s.firstName,
      middleInitial: s.middleInitial,
      gender: s.gender,
      birthday: s.birthday?.toISOString().slice(0, 10),
    }));
  },

  async update(id: string, teacherId: string, dto: UpdateClassLoadDto) {
    const load = await ClassLoad.findOneAndUpdate(
      { _id: id, teacherId, isActive: true },
      { $set: dto },
      { new: true },
    )
      .populate('subjectId', 'name gradeLevel')
      .populate('sectionId', 'name gradeLevel')
      .lean();

    if (!load) {
      throw Object.assign(new Error('Class load not found'), { statusCode: 404 });
    }

    if (dto.schedule?.timeStart) {
      const [startH = 0, startM = 0] = dto.schedule.timeStart.split(':').map(Number);
      const [endH = 0, endM = 0] = (dto.schedule.timeEnd ?? '').split(':').map(Number);
      const durMin = Math.max(30, endH * 60 + endM - startH * 60 - startM);

      await Schedule.updateMany(
        { classLoadId: new mongoose.Types.ObjectId(id), teacherId: new mongoose.Types.ObjectId(teacherId) },
        { $set: { startH, startM, durMin, ...(dto.roomNumber !== undefined && { room: dto.roomNumber }) } },
      );
    }

    const studentCount = await Student.countDocuments({
      sectionId: load.sectionId,
      isActive: true,
    });

    const item = toListItem(load as Parameters<typeof toListItem>[0], studentCount);
    return { ...item, schedule: load.schedule };
  },

  async create(teacherId: string, dto: CreateClassLoadDto) {
    const teacher = await User.findById(teacherId);
    if (!teacher) {
      throw Object.assign(new Error('Teacher not found'), { statusCode: 404 });
    }
    const schoolId = teacher.schoolId;

    const activeYear = await SchoolYear.findOne({ schoolId, isActive: true });
    if (!activeYear) {
      throw Object.assign(
        new Error('No active school year found. Ask your admin to activate a school year.'),
        { statusCode: 422 },
      );
    }

    // find-or-create subject
    let subject = await Subject.findOne({
      schoolId,
      name: { $regex: new RegExp(`^${dto.subjectName}$`, 'i') },
      gradeLevel: dto.gradeLevel,
    });
    if (!subject) {
      subject = await Subject.create({
        schoolId,
        name: dto.subjectName,
        gradeLevel: dto.gradeLevel,
      });
    }

    // find-or-create section
    let section = await Section.findOne({
      schoolId,
      schoolYearId: activeYear._id,
      gradeLevel: dto.gradeLevel,
      name: { $regex: new RegExp(`^${dto.sectionName}$`, 'i') },
    });
    if (!section) {
      section = await Section.create({
        schoolId,
        schoolYearId: activeYear._id,
        gradeLevel: dto.gradeLevel,
        name: dto.sectionName,
        adviserId: teacherId,
      });
    }

    const load = await ClassLoad.create({
      teacherId,
      subjectId: subject._id,
      sectionId: section._id,
      schoolYearId: activeYear._id,
      quarter: dto.quarter,
      roomNumber: dto.roomNumber ?? '',
      schedule: dto.schedule ?? { dayOfWeek: [], timeStart: '', timeEnd: '' },
      weights: dto.weights,
    });

    return {
      id: (load._id as mongoose.Types.ObjectId).toString(),
      teacherId: load.teacherId.toString(),
      subjectId: (subject._id as mongoose.Types.ObjectId).toString(),
      sectionId: (section._id as mongoose.Types.ObjectId).toString(),
      schoolYearId: (activeYear._id as mongoose.Types.ObjectId).toString(),
      quarter: load.quarter,
      roomNumber: load.roomNumber,
      wwWeight: load.weights.ww,
      ptWeight: load.weights.pt,
      qaWeight: load.weights.qa,
      subject: {
        id: (subject._id as mongoose.Types.ObjectId).toString(),
        name: subject.name,
        gradeLevel: `Grade ${subject.gradeLevel}`,
      },
      section: {
        id: (section._id as mongoose.Types.ObjectId).toString(),
        name: section.name,
        gradeLevel: `Grade ${section.gradeLevel}`,
      },
      studentCount: 0,
    };
  },
};
