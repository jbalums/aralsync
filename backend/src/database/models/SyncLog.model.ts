import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ISyncLogDocument extends Document {
  teacherId:   mongoose.Types.ObjectId;
  schoolId:    mongoose.Types.ObjectId;
  type:        'push' | 'pull';
  recordCount: number;
  status:      'success' | 'failed';
  error?:      string;
}

const syncLogSchema = new Schema<ISyncLogDocument>(
  {
    teacherId:   { type: Schema.Types.ObjectId, ref: 'User',   required: true },
    schoolId:    { type: Schema.Types.ObjectId, ref: 'School', required: true },
    type:        { type: String, enum: ['push', 'pull'],              required: true },
    recordCount: { type: Number, default: 0 },
    status:      { type: String, enum: ['success', 'failed'],         required: true },
    error:       { type: String },
  },
  { timestamps: true },
);

syncLogSchema.index({ teacherId: 1, createdAt: -1 });

export const SyncLog: Model<ISyncLogDocument> = mongoose.model<ISyncLogDocument>(
  'SyncLog',
  syncLogSchema,
);
