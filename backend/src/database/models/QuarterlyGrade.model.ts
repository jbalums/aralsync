import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IQuarterlyGradeDocument extends Document {
  classLoadId:     mongoose.Types.ObjectId;
  studentId:       mongoose.Types.ObjectId;
  quarter:         string;
  wwWeighted:      number;
  ptWeighted:      number;
  qaWeighted:      number;
  initialGrade:    number;
  transmutedGrade: number;
  isFinalized:     boolean;
  syncStatus:      string;
  updatedAt:       Date;
}

const quarterlyGradeSchema = new Schema<IQuarterlyGradeDocument>(
  {
    classLoadId:     { type: Schema.Types.ObjectId, ref: 'ClassLoad', required: true },
    studentId:       { type: Schema.Types.ObjectId, ref: 'Student',   required: true },
    quarter:         { type: String, enum: ['Q1', 'Q2', 'Q3', 'Q4'], required: true },
    wwWeighted:      { type: Number, required: true },
    ptWeighted:      { type: Number, required: true },
    qaWeighted:      { type: Number, required: true },
    initialGrade:    { type: Number, required: true },
    transmutedGrade: { type: Number, required: true },
    isFinalized:     { type: Boolean, default: false },
    syncStatus:      { type: String, default: 'synced' },
  },
  { timestamps: true },
);

quarterlyGradeSchema.index({ classLoadId: 1, quarter: 1 });
quarterlyGradeSchema.index(
  { classLoadId: 1, studentId: 1, quarter: 1 },
  { unique: true },
);

export const QuarterlyGrade: Model<IQuarterlyGradeDocument> =
  mongoose.model<IQuarterlyGradeDocument>('QuarterlyGrade', quarterlyGradeSchema);
