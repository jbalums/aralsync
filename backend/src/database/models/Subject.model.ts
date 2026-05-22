import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ISubjectDocument extends Document {
  schoolId: mongoose.Types.ObjectId;
  name: string;
  gradeLevel: number;
  description: string;
  isActive: boolean;
}

const subjectSchema = new Schema<ISubjectDocument>(
  {
    schoolId: { type: Schema.Types.ObjectId, ref: 'School', required: true },
    name: { type: String, required: true, trim: true },
    gradeLevel: { type: Number, required: true, min: 7, max: 12 },
    description: { type: String, default: '', trim: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

subjectSchema.index({ schoolId: 1 });

export const Subject: Model<ISubjectDocument> = mongoose.model<ISubjectDocument>(
  'Subject',
  subjectSchema,
);
