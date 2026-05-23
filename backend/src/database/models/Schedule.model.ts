import mongoose, { Schema, Document, Model } from 'mongoose';

export type ScheduleType = 'class' | 'duty' | 'meeting' | 'break';

export interface IScheduleDocument extends Document {
  teacherId:    mongoose.Types.ObjectId;
  schoolYearId?: mongoose.Types.ObjectId;
  classLoadId?: mongoose.Types.ObjectId;
  title:        string;
  section:      string;
  room:         string;
  dayOfWeek:    number; // 0=Sun, 1=Mon, ..., 6=Sat
  startH:       number;
  startM:       number;
  durMin:       number;
  type:         ScheduleType;
}

const scheduleSchema = new Schema<IScheduleDocument>(
  {
    teacherId:    { type: Schema.Types.ObjectId, ref: 'User',       required: true },
    schoolYearId: { type: Schema.Types.ObjectId, ref: 'SchoolYear' },
    classLoadId:  { type: Schema.Types.ObjectId, ref: 'ClassLoad'  },
    title:        { type: String,  required: true, trim: true },
    section:      { type: String,  default: '',    trim: true },
    room:         { type: String,  default: '',    trim: true },
    dayOfWeek:    { type: Number,  required: true, min: 0, max: 6 },
    startH:       { type: Number,  required: true, min: 0, max: 23 },
    startM:       { type: Number,  required: true, min: 0, max: 59, default: 0 },
    durMin:       { type: Number,  required: true, min: 1, default: 60 },
    type:         { type: String,  enum: ['class', 'duty', 'meeting', 'break'], required: true },
  },
  { timestamps: true },
);

scheduleSchema.index({ teacherId: 1, dayOfWeek: 1 });
scheduleSchema.index({ teacherId: 1, schoolYearId: 1 });

export const Schedule: Model<IScheduleDocument> = mongoose.model<IScheduleDocument>(
  'Schedule',
  scheduleSchema,
);
