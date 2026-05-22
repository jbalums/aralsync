import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ISchoolYearDocument extends Document {
  schoolId: mongoose.Types.ObjectId;
  label: string;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
}

const schoolYearSchema = new Schema<ISchoolYearDocument>(
  {
    schoolId: { type: Schema.Types.ObjectId, ref: 'School', required: true },
    label: { type: String, required: true, trim: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    isActive: { type: Boolean, default: false },
  },
  { timestamps: true },
);

schoolYearSchema.index({ schoolId: 1, isActive: 1 });

export const SchoolYear: Model<ISchoolYearDocument> = mongoose.model<ISchoolYearDocument>(
  'SchoolYear',
  schoolYearSchema,
);
