import mongoose, { Schema, Document, Model } from 'mongoose';
import { Role } from '../../shared/types';

export interface IUserDocument extends Document {
  email: string;
  passwordHash: string;
  fullName: string;
  employeeNumber: string;
  position: string;
  avatarUrl: string;
  schoolId?: mongoose.Types.ObjectId;
  role: Role;
  deviceIds: string[];
  refreshTokens: string[];
  isActive: boolean;
  department?: string;
  lastSeenAt?: Date;
}

const userSchema = new Schema<IUserDocument>(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    fullName: { type: String, required: true, trim: true },
    employeeNumber: { type: String, trim: true, default: '' },
    position:       { type: String, trim: true, default: '' },
    avatarUrl:      { type: String, default: '' },
    schoolId: { type: Schema.Types.ObjectId, ref: 'School', required: false },
    role: { type: String, enum: Object.values(Role), required: true },
    deviceIds: [{ type: String }],
    refreshTokens: [{ type: String }],
    isActive: { type: Boolean, default: true },
    department:  { type: String, trim: true, default: '' },
    lastSeenAt:  { type: Date },
  },
  { timestamps: true },
);

userSchema.index({ email: 1 });
userSchema.index({ schoolId: 1 });

userSchema.set('toJSON', {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  transform: (_doc: unknown, ret: any) => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    delete ret.passwordHash;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    delete ret.refreshTokens;
    return ret;
  },
});

export const User: Model<IUserDocument> = mongoose.model<IUserDocument>('User', userSchema);
