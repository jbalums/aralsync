import mongoose from 'mongoose';
import { Schedule } from '../../database/models/Schedule.model';
import type { ScheduleType } from '../../database/models/Schedule.model';

export interface ScheduleItem {
  id:          string;
  dayOfWeek:   number;
  title:       string;
  section:     string;
  room:        string;
  startH:      number;
  startM:      number;
  durMin:      number;
  type:        ScheduleType;
  classLoadId?: string;
}

function toItem(doc: InstanceType<typeof Schedule>): ScheduleItem {
  return {
    id:          (doc._id as mongoose.Types.ObjectId).toString(),
    dayOfWeek:   doc.dayOfWeek,
    title:       doc.title,
    section:     doc.section,
    room:        doc.room,
    startH:      doc.startH,
    startM:      doc.startM,
    durMin:      doc.durMin,
    type:        doc.type,
    classLoadId: doc.classLoadId?.toString(),
  };
}

function startMinutes(item: { startH: number; startM: number }): number {
  return item.startH * 60 + item.startM;
}

export const scheduleService = {
  async getWeekly(teacherId: string): Promise<ScheduleItem[]> {
    const docs = await Schedule.find({ teacherId: new mongoose.Types.ObjectId(teacherId) })
      .sort({ dayOfWeek: 1, startH: 1, startM: 1 });
    return docs.map(toItem);
  },

  async create(
    teacherId: string,
    data: {
      title: string; section: string; room: string;
      dayOfWeek: number; startH: number; startM: number; durMin: number;
      type: ScheduleType; classLoadId?: string; schoolYearId?: string;
    },
  ): Promise<ScheduleItem> {
    const doc = await Schedule.create({
      teacherId: new mongoose.Types.ObjectId(teacherId),
      ...data,
      classLoadId:  data.classLoadId  ? new mongoose.Types.ObjectId(data.classLoadId)  : undefined,
      schoolYearId: data.schoolYearId ? new mongoose.Types.ObjectId(data.schoolYearId) : undefined,
    });
    return toItem(doc);
  },

  async update(
    id: string,
    teacherId: string,
    data: Partial<{
      title: string; section: string; room: string;
      dayOfWeek: number; startH: number; startM: number; durMin: number;
      type: ScheduleType; classLoadId?: string;
    }>,
  ): Promise<ScheduleItem> {
    const doc = await Schedule.findOneAndUpdate(
      { _id: new mongoose.Types.ObjectId(id), teacherId: new mongoose.Types.ObjectId(teacherId) },
      {
        ...data,
        classLoadId: data.classLoadId ? new mongoose.Types.ObjectId(data.classLoadId) : undefined,
      },
      { new: true },
    );
    if (!doc) throw Object.assign(new Error('Schedule not found'), { status: 404 });
    return toItem(doc);
  },

  async delete(id: string, teacherId: string): Promise<void> {
    const result = await Schedule.deleteOne({
      _id: new mongoose.Types.ObjectId(id),
      teacherId: new mongoose.Types.ObjectId(teacherId),
    });
    if (result.deletedCount === 0) throw Object.assign(new Error('Schedule not found'), { status: 404 });
  },

  async checkConflict(
    teacherId: string,
    dayOfWeek: number,
    startH: number,
    startM: number,
    durMin: number,
    excludeId?: string,
  ): Promise<ScheduleItem[]> {
    const query: Record<string, unknown> = {
      teacherId: new mongoose.Types.ObjectId(teacherId),
      dayOfWeek,
    };
    if (excludeId) query._id = { $ne: new mongoose.Types.ObjectId(excludeId) };

    const same = await Schedule.find(query);
    const newStart = startH * 60 + startM;
    const newEnd   = newStart + durMin;

    return same
      .filter(doc => {
        const s = startMinutes(doc);
        return s < newEnd && (s + doc.durMin) > newStart;
      })
      .map(toItem);
  },
};
