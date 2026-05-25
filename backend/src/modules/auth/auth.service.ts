import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import { User, IUserDocument, IDevice } from '../../database/models/User.model';
import { School } from '../../database/models/School.model';
import { Role, JwtPayload } from '../../shared/types';
import { inferDeviceInfo } from '../../shared/utils/userAgent';

const ACCESS_EXPIRES = process.env.JWT_ACCESS_EXPIRES ?? '15m';
const REFRESH_EXPIRES = process.env.JWT_REFRESH_EXPIRES ?? '7d';

function issueTokens(
  userId: string,
  name: string,
  email: string,
  role: Role,
  schoolId: string | undefined,
  deviceId: string,
): { accessToken: string; refreshToken: string } {
  const payload: JwtPayload = { userId, name, email, role, schoolId, deviceId };
  const accessToken = jwt.sign(payload, process.env.JWT_SECRET as string, {
    expiresIn: ACCESS_EXPIRES,
  } as jwt.SignOptions);
  const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET as string, {
    expiresIn: REFRESH_EXPIRES,
  } as jwt.SignOptions);
  return { accessToken, refreshToken };
}

function toClientUser(user: IUserDocument, deviceId: string) {
  return {
    id:             (user._id as mongoose.Types.ObjectId).toString(),
    email:          user.email,
    name:           user.fullName,
    employeeNumber: user.employeeNumber ?? '',
    position:       user.position ?? '',
    avatarUrl:      user.avatarUrl ?? '',
    schoolId:       user.schoolId?.toString() ?? '',
    role:           user.role,
    deviceId,
  };
}

function toDeviceDto(d: IDevice, currentDeviceId: string) {
  return {
    deviceId:   d.deviceId,
    name:       d.name,
    type:       d.type,
    current:    d.deviceId === currentDeviceId,
    createdAt:  d.createdAt.toISOString(),
    lastSeenAt: d.lastSeenAt.toISOString(),
  };
}

function buildDevice(opts: {
  deviceId: string;
  deviceName?: string;
  userAgent?: string;
}): IDevice {
  const ua = opts.userAgent ?? '';
  const inferred = inferDeviceInfo(ua);
  const now = new Date();
  return {
    deviceId:   opts.deviceId,
    name:       opts.deviceName?.trim() || inferred.name,
    type:       inferred.type,
    userAgent:  ua,
    createdAt:  now,
    lastSeenAt: now,
  };
}

function upsertDevice(
  user: IUserDocument,
  opts: { deviceId: string; deviceName?: string; userAgent?: string },
): void {
  const existing = user.devices.find(d => d.deviceId === opts.deviceId);
  if (existing) {
    existing.lastSeenAt = new Date();
    if (opts.userAgent && !existing.userAgent) existing.userAgent = opts.userAgent;
    return;
  }
  user.devices.push(buildDevice(opts));
}

export const authService = {
  async register(data: {
    email: string;
    password: string;
    name: string;
    schoolId: string;
    deviceId: string;
    deviceName?: string;
    userAgent?: string;
  }) {
    const existing = await User.findOne({ email: data.email.toLowerCase() });
    if (existing) {
      throw Object.assign(new Error('Email already registered'), { statusCode: 409 });
    }

    const school = await School.findOne({ schoolId: data.schoolId });
    if (!school) {
      throw Object.assign(
        new Error(`School with ID "${data.schoolId}" not found. Ask your admin to register the school first.`),
        { statusCode: 404 },
      );
    }

    const passwordHash = await bcrypt.hash(data.password, 12);

    const user = await User.create({
      email: data.email.toLowerCase(),
      passwordHash,
      fullName: data.name,
      schoolId: school._id,
      role: Role.SUBJECT_TEACHER,
      devices: [buildDevice({ deviceId: data.deviceId, deviceName: data.deviceName, userAgent: data.userAgent })],
      refreshTokens: [],
    });

    const tokens = issueTokens(
      (user._id as mongoose.Types.ObjectId).toString(),
      user.fullName,
      user.email,
      user.role,
      school._id.toString(),
      data.deviceId,
    );

    user.refreshTokens.push(tokens.refreshToken);
    await user.save();

    return { user: toClientUser(user, data.deviceId), tokens };
  },

  async login(data: {
    email: string;
    password: string;
    deviceId: string;
    deviceName?: string;
    userAgent?: string;
  }) {
    const user = await User.findOne({ email: data.email.toLowerCase(), isActive: true }).select(
      '+passwordHash +refreshTokens',
    );
    if (!user) {
      throw Object.assign(new Error('Invalid email or password'), { statusCode: 401 });
    }

    const valid = await bcrypt.compare(data.password, user.passwordHash);
    if (!valid) {
      throw Object.assign(new Error('Invalid email or password'), { statusCode: 401 });
    }

    upsertDevice(user, data);

    const tokens = issueTokens(
      (user._id as mongoose.Types.ObjectId).toString(),
      user.fullName,
      user.email,
      user.role,
      user.schoolId?.toString(),
      data.deviceId,
    );

    user.refreshTokens = [...user.refreshTokens.slice(-9), tokens.refreshToken];
    user.lastSeenAt = new Date();
    await user.save();

    return { user: toClientUser(user, data.deviceId), tokens };
  },

  async refresh(refreshToken: string) {
    let payload: JwtPayload;
    try {
      payload = jwt.verify(
        refreshToken,
        process.env.JWT_REFRESH_SECRET as string,
      ) as JwtPayload;
    } catch {
      throw Object.assign(new Error('Invalid or expired refresh token'), { statusCode: 401 });
    }

    const user = await User.findById(payload.userId).select('+refreshTokens');
    if (!user || !user.refreshTokens.includes(refreshToken)) {
      throw Object.assign(new Error('Refresh token revoked'), { statusCode: 401 });
    }

    const deviceId = payload.deviceId ?? '';
    const device = user.devices.find(d => d.deviceId === deviceId);
    if (deviceId && !device) {
      // Device was revoked while this token was still in the array. Kill it.
      user.refreshTokens = user.refreshTokens.filter(t => t !== refreshToken);
      await user.save();
      throw Object.assign(new Error('Device revoked'), { statusCode: 401 });
    }
    if (device) device.lastSeenAt = new Date();

    const tokens = issueTokens(
      payload.userId,
      user.fullName,
      payload.email,
      payload.role,
      payload.schoolId,
      deviceId,
    );

    user.refreshTokens = user.refreshTokens
      .filter((t) => t !== refreshToken)
      .concat(tokens.refreshToken)
      .slice(-10);
    user.lastSeenAt = new Date();
    await user.save();

    return tokens;
  },

  async logout(refreshToken: string) {
    let payload: JwtPayload;
    try {
      payload = jwt.verify(
        refreshToken,
        process.env.JWT_REFRESH_SECRET as string,
      ) as JwtPayload;
    } catch {
      return;
    }

    await User.findByIdAndUpdate(payload.userId, {
      $pull: { refreshTokens: refreshToken },
    });
  },

  async me(userId: string, currentDeviceId: string) {
    const user = await User.findById(userId);
    if (!user) {
      throw Object.assign(new Error('User not found'), { statusCode: 404 });
    }
    return toClientUser(user, currentDeviceId || user.devices[0]?.deviceId || '');
  },

  async updateProfile(
    userId: string,
    currentDeviceId: string,
    data: { name?: string; employeeNumber?: string; position?: string; avatarUrl?: string },
  ) {
    const update: Record<string, string> = {};
    if (data.name           !== undefined) update.fullName       = data.name;
    if (data.employeeNumber !== undefined) update.employeeNumber = data.employeeNumber;
    if (data.position       !== undefined) update.position       = data.position;
    if (data.avatarUrl      !== undefined) update.avatarUrl      = data.avatarUrl;

    const user = await User.findByIdAndUpdate(userId, { $set: update }, { new: true });
    if (!user) {
      throw Object.assign(new Error('User not found'), { statusCode: 404 });
    }
    return toClientUser(user, currentDeviceId || user.devices[0]?.deviceId || '');
  },

  async listDevices(userId: string, currentDeviceId: string) {
    const user = await User.findById(userId);
    if (!user) throw Object.assign(new Error('User not found'), { statusCode: 404 });
    return [...user.devices]
      .sort((a, b) => b.lastSeenAt.getTime() - a.lastSeenAt.getTime())
      .map(d => toDeviceDto(d, currentDeviceId));
  },

  async renameDevice(userId: string, deviceId: string, name: string, currentDeviceId: string) {
    const user = await User.findById(userId);
    if (!user) throw Object.assign(new Error('User not found'), { statusCode: 404 });
    const device = user.devices.find(d => d.deviceId === deviceId);
    if (!device) throw Object.assign(new Error('Device not found'), { statusCode: 404 });
    device.name = name.trim();
    await user.save();
    return toDeviceDto(device, currentDeviceId);
  },

  async revokeDevice(userId: string, deviceId: string, currentDeviceId: string) {
    const user = await User.findById(userId).select('+refreshTokens');
    if (!user) throw Object.assign(new Error('User not found'), { statusCode: 404 });

    const before = user.devices.length;
    user.devices = user.devices.filter(d => d.deviceId !== deviceId);
    if (user.devices.length === before) {
      throw Object.assign(new Error('Device not found'), { statusCode: 404 });
    }

    // Drop refresh tokens that belong to this device (decode each; keep undecodable + non-matching).
    user.refreshTokens = user.refreshTokens.filter(token => {
      try {
        const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET as string) as JwtPayload;
        return decoded.deviceId !== deviceId;
      } catch {
        return false;
      }
    });

    await user.save();
    return { revokedSelf: deviceId === currentDeviceId };
  },

  async touchDevice(userId: string, deviceId: string): Promise<void> {
    if (!userId || !deviceId) return;
    await User.updateOne(
      { _id: userId, 'devices.deviceId': deviceId },
      { $set: { 'devices.$.lastSeenAt': new Date() } },
    ).catch(() => undefined);
  },
};
