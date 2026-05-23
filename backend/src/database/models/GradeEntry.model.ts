import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IGradeEntryDocument extends Document {
  classLoadId: mongoose.Types.ObjectId;
  studentId:   mongoose.Types.ObjectId;
  quarter:     string;
  component:   string;
  columnLabel: string;
  score:       number;
  maxScore:    number;
  syncStatus:  string;
  clientId:    string;
  updatedAt:   Date;
}

const gradeEntrySchema = new Schema<IGradeEntryDocument>(
  {
    classLoadId: { type: Schema.Types.ObjectId, ref: 'ClassLoad', required: true },
    studentId:   { type: Schema.Types.ObjectId, ref: 'Student',   required: true },
    quarter:     { type: String, enum: ['Q1', 'Q2', 'Q3', 'Q4'], required: true },
    component:   { type: String, enum: ['WW', 'PT', 'QA'],        required: true },
    columnLabel: { type: String, required: true, trim: true },
    score:       { type: Number, required: true, min: 0 },
    maxScore:    { type: Number, required: true, min: 1 },
    syncStatus:  { type: String, default: 'synced' },
    clientId:    { type: String, default: '' },
  },
  { timestamps: true },
);

gradeEntrySchema.index({ classLoadId: 1, quarter: 1 });
gradeEntrySchema.index({ studentId: 1, quarter: 1 });
gradeEntrySchema.index(
  { classLoadId: 1, studentId: 1, quarter: 1, component: 1, columnLabel: 1 },
  { unique: true },
);

export const GradeEntry: Model<IGradeEntryDocument> =
  mongoose.model<IGradeEntryDocument>('GradeEntry', gradeEntrySchema);
