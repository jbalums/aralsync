import mongoose, { Schema, Document } from 'mongoose';

export interface IAuditLogDocument extends Document {
  schoolId: mongoose.Types.ObjectId;
  actorId: mongoose.Types.ObjectId;
  actorName: string;
  action: string;
  target: string;
  tone: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
}

const auditLogSchema = new Schema<IAuditLogDocument>(
  {
    schoolId:  { type: Schema.Types.ObjectId, ref: 'School', required: true, index: true },
    actorId:   { type: Schema.Types.ObjectId, ref: 'User', required: true },
    actorName: { type: String, required: true },
    action:    { type: String, required: true },
    target:    { type: String, required: true },
    tone:      { type: String, required: true, default: 'system' },
    metadata:  { type: Schema.Types.Mixed },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

auditLogSchema.index({ schoolId: 1, createdAt: -1 });

export const AuditLog = mongoose.model<IAuditLogDocument>('AuditLog', auditLogSchema);
