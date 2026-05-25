import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(2, 'Name is required'),
  schoolId: z.string().min(1, 'School ID is required'),
  deviceId: z.string().min(1),
  deviceName: z.string().trim().min(1).max(60).optional(),
  userAgent:  z.string().max(500).optional(),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
  deviceId: z.string().min(1),
  deviceName: z.string().trim().min(1).max(60).optional(),
  userAgent:  z.string().max(500).optional(),
});

export const refreshSchema = z.object({
  refreshToken: z.string().min(1),
});

export const logoutSchema = z.object({
  refreshToken: z.string().min(1),
});

export const updateProfileSchema = z.object({
  name:           z.string().min(2).optional(),
  employeeNumber: z.string().optional(),
  position:       z.string().optional(),
  avatarUrl:      z.string().max(200_000).optional(),
});

export const renameDeviceSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(60, 'Name is too long'),
});
