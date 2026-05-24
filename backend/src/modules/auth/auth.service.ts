import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import { User, IUserDocument } from '../../database/models/User.model';
import { School } from '../../database/models/School.model';
import { Role, JwtPayload } from '../../shared/types';

const ACCESS_EXPIRES = process.env.JWT_ACCESS_EXPIRES ?? '15m';
const REFRESH_EXPIRES = process.env.JWT_REFRESH_EXPIRES ?? '7d';

function issueTokens(
  userId: string,
  email: string,
  role: Role,
  schoolId: string | undefined,
  deviceId: string,
): { accessToken: string; refreshToken: string } {
  const payload: JwtPayload = { userId, email, role, schoolId, deviceId };
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

export const authService = {
  async register(data: {
    email: string;
    password: string;
    name: string;
    schoolId: string;
    deviceId: string;
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
      deviceIds: [data.deviceId],
      refreshTokens: [],
    });

    const tokens = issueTokens(
      (user._id as mongoose.Types.ObjectId).toString(),
      user.email,
      user.role,
      school._id.toString(),
      data.deviceId,
    );

    user.refreshTokens.push(tokens.refreshToken);
    await user.save();

    return { user: toClientUser(user, data.deviceId), tokens };
  },

  async login(data: { email: string; password: string; deviceId: string }) {
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

    if (!user.deviceIds.includes(data.deviceId)) {
      user.deviceIds.push(data.deviceId);
    }

    const tokens = issueTokens(
      (user._id as mongoose.Types.ObjectId).toString(),
      user.email,
      user.role,
      user.schoolId?.toString(),
      data.deviceId,
    );

    // keep only last 10 refresh tokens per user
    user.refreshTokens = [...user.refreshTokens.slice(-9), tokens.refreshToken];
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

    const tokens = issueTokens(
      payload.userId,
      payload.email,
      payload.role,
      payload.schoolId,
      payload.deviceId ?? '',
    );

    user.refreshTokens = user.refreshTokens
      .filter((t) => t !== refreshToken)
      .concat(tokens.refreshToken)
      .slice(-10);
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
      return; // token already expired, treat as logged out
    }

    await User.findByIdAndUpdate(payload.userId, {
      $pull: { refreshTokens: refreshToken },
    });
  },

  async me(userId: string) {
    const user = await User.findById(userId);
    if (!user) {
      throw Object.assign(new Error('User not found'), { statusCode: 404 });
    }
    // deviceId not critical for /me — return first device
    return toClientUser(user, user.deviceIds[0] ?? '');
  },

  async updateProfile(
    userId: string,
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
    return toClientUser(user, user.deviceIds[0] ?? '');
  },
};
