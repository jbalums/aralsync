import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ISectionDocument extends Document {
  schoolId: mongoose.Types.ObjectId;
  schoolYearId: mongoose.Types.ObjectId;
  gradeLevel: number;
  name: string;
  adviserId: mongoose.Types.ObjectId;
  isActive: boolean;
}

const sectionSchema = new Schema<ISectionDocument>(
  {
    schoolId: { type: Schema.Types.ObjectId, ref: 'School', required: true },
    schoolYearId: { type: Schema.Types.ObjectId, ref: 'SchoolYear', required: true },
    gradeLevel: { type: Number, required: true, min: 7, max: 12 },
    name: { type: String, required: true, trim: true },
    adviserId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

sectionSchema.index({ schoolId: 1, schoolYearId: 1 });
sectionSchema.index({ adviserId: 1 });

export const Section: Model<ISectionDocument> = mongoose.model<ISectionDocument>(
  'Section',
  sectionSchema,
);
