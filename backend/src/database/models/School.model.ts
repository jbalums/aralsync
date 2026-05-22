import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ISchoolDocument extends Document {
  name: string;
  schoolId: string;
  division: string;
  district: string;
  address: string;
  isActive: boolean;
}

const schoolSchema = new Schema<ISchoolDocument>(
  {
    name: { type: String, required: true, trim: true },
    schoolId: { type: String, required: true, unique: true, trim: true },
    division: { type: String, required: true, trim: true },
    district: { type: String, default: '', trim: true },
    address: { type: String, default: '', trim: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

schoolSchema.index({ schoolId: 1 });

export const School: Model<ISchoolDocument> = mongoose.model<ISchoolDocument>('School', schoolSchema);
