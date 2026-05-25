import mongoose, { Schema, Document, Model } from 'mongoose';
import { Role } from '../../shared/types';
import type { DeviceType } from '../../shared/utils/userAgent';

export interface IDevice {
  deviceId:   string;
  name:       string;
  type:       DeviceType;
  userAgent:  string;
  createdAt:  Date;
  lastSeenAt: Date;
}

export interface IUserDocument extends Document {
  email: string;
  passwordHash: string;
  fullName: string;
  employeeNumber: string;
  position: string;
  avatarUrl: string;
  schoolId?: mongoose.Types.ObjectId;
  role: Role;
  devices: IDevice[];
  refreshTokens: string[];
  isActive: boolean;
  department?: string;
  lastSeenAt?: Date;
}

const deviceSchema = new Schema<IDevice>(
  {
    deviceId:   { type: String, required: true },
    name:       { type: String, required: true, trim: true },
    type:       { type: String, enum: ['tablet', 'laptop', 'phone', 'desktop', 'other'], default: 'other' },
    userAgent:  { type: String, default: '' },
    createdAt:  { type: Date, default: () => new Date() },
    lastSeenAt: { type: Date, default: () => new Date() },
  },
  { _id: false },
);

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
    devices: { type: [deviceSchema], default: [] },
    refreshTokens: [{ type: String }],
    isActive: { type: Boolean, default: true },
    department:  { type: String, trim: true, default: '' },
    lastSeenAt:  { type: Date },
  },
  { timestamps: true },
);

userSchema.index({ email: 1 });
userSchema.index({ schoolId: 1 });
userSchema.index({ 'devices.deviceId': 1 });

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
