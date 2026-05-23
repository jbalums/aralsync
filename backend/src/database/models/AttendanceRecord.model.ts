import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IAttendanceRecordDocument extends Document {
  classLoadId: mongoose.Types.ObjectId;
  studentId:   mongoose.Types.ObjectId;
  date:        Date;
  session:     string;
  status:      string;
  recordedBy:  mongoose.Types.ObjectId;
  syncStatus:  string;
  clientId:    string;
  updatedAt:   Date;
}

const attendanceRecordSchema = new Schema<IAttendanceRecordDocument>(
  {
    classLoadId: { type: Schema.Types.ObjectId, ref: 'ClassLoad', required: true },
    studentId:   { type: Schema.Types.ObjectId, ref: 'Student',   required: true },
    date:        { type: Date,   required: true },
    session:     { type: String, enum: ['AM', 'PM'], required: true },
    status:      { type: String, enum: ['present', 'absent', 'late', 'excused'], required: true },
    recordedBy:  { type: Schema.Types.ObjectId, ref: 'User', required: true },
    syncStatus:  { type: String, default: 'synced' },
    clientId:    { type: String, default: '' },
  },
  { timestamps: true },
);

attendanceRecordSchema.index({ classLoadId: 1, date: 1 });
attendanceRecordSchema.index({ studentId: 1, date: 1 });
attendanceRecordSchema.index({ classLoadId: 1, studentId: 1, date: 1, session: 1 }, { unique: true });

export const AttendanceRecord: Model<IAttendanceRecordDocument> =
  mongoose.model<IAttendanceRecordDocument>('AttendanceRecord', attendanceRecordSchema);
