import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IStudentDocument extends Document {
  lrn: string;
  lastName: string;
  firstName: string;
  middleName: string;
  gender: 'M' | 'F';
  birthday: Date;
  sectionId: mongoose.Types.ObjectId;
  schoolId: mongoose.Types.ObjectId;
  guardian: {
    name: string;
    relationship: string;
    contactNumber: string;
  };
  isActive: boolean;
}

const studentSchema = new Schema<IStudentDocument>(
  {
    lrn: { type: String, required: true, unique: true, trim: true, length: 12 },
    lastName: { type: String, required: true, trim: true },
    firstName: { type: String, required: true, trim: true },
    middleName: { type: String, default: '', trim: true },
    gender: { type: String, enum: ['M', 'F'], required: true },
    birthday: { type: Date },
    sectionId: { type: Schema.Types.ObjectId, ref: 'Section', required: true },
    schoolId: { type: Schema.Types.ObjectId, ref: 'School', required: true },
    guardian: {
      name: { type: String, default: '' },
      relationship: { type: String, default: '' },
      contactNumber: { type: String, default: '' },
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

studentSchema.index({ sectionId: 1, lastName: 1 });
studentSchema.index({ schoolId: 1 });
studentSchema.index({ lrn: 1 }, { unique: true });

export const Student: Model<IStudentDocument> = mongoose.model<IStudentDocument>(
  'Student',
  studentSchema,
);
