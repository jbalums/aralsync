import mongoose, { Schema, Document, Model } from 'mongoose';
import { Quarter } from '../../shared/types';

export interface IClassLoadDocument extends Document {
  teacherId: mongoose.Types.ObjectId;
  subjectId: mongoose.Types.ObjectId;
  sectionId: mongoose.Types.ObjectId;
  schoolYearId: mongoose.Types.ObjectId;
  quarter: Quarter;
  roomNumber: string;
  schedule: {
    dayOfWeek: number[];
    timeStart: string;
    timeEnd: string;
  };
  weights: {
    ww: number;
    pt: number;
    qa: number;
  };
  isActive: boolean;
}

const classLoadSchema = new Schema<IClassLoadDocument>(
  {
    teacherId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    subjectId: { type: Schema.Types.ObjectId, ref: 'Subject', required: true },
    sectionId: { type: Schema.Types.ObjectId, ref: 'Section', required: true },
    schoolYearId: { type: Schema.Types.ObjectId, ref: 'SchoolYear', required: true },
    quarter: { type: String, enum: ['Q1', 'Q2', 'Q3', 'Q4'], required: true },
    roomNumber: { type: String, default: '', trim: true },
    schedule: {
      dayOfWeek: [{ type: Number, min: 0, max: 6 }],
      timeStart: { type: String, default: '' },
      timeEnd: { type: String, default: '' },
    },
    weights: {
      ww: { type: Number, default: 0.2, min: 0, max: 1 },
      pt: { type: Number, default: 0.6, min: 0, max: 1 },
      qa: { type: Number, default: 0.2, min: 0, max: 1 },
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

classLoadSchema.index({ teacherId: 1, isActive: 1 });
classLoadSchema.index({ sectionId: 1, schoolYearId: 1 });

export const ClassLoad: Model<IClassLoadDocument> = mongoose.model<IClassLoadDocument>(
  'ClassLoad',
  classLoadSchema,
);
