import { Request, Response, NextFunction } from 'express';
import { authService } from './auth.service';
import { success } from '../../shared/utils/response';

function pickUserAgent(req: Request, bodyUA?: string): string {
  return (bodyUA && bodyUA.length > 0 ? bodyUA : (req.headers['user-agent'] ?? '')) as string;
}

export const authController = {
  async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const body = req.body as {
        email: string; password: string; name: string; schoolId: string;
        deviceId: string; deviceName?: string; userAgent?: string;
      };
      const result = await authService.register({
        ...body,
        userAgent: pickUserAgent(req, body.userAgent),
      });
      success(res, result, 201);
    } catch (err) {
      next(err);
    }
  },

  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const body = req.body as {
        email: string; password: string; deviceId: string;
        deviceName?: string; userAgent?: string;
      };
      const result = await authService.login({
        ...body,
        userAgent: pickUserAgent(req, body.userAgent),
      });
      success(res, result);
    } catch (err) {
      next(err);
    }
  },

  async refresh(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const tokens = await authService.refresh((req.body as { refreshToken: string }).refreshToken);
      success(res, tokens);
    } catch (err) {
      next(err);
    }
  },

  async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await authService.logout((req.body as { refreshToken: string }).refreshToken);
      success(res, null, 204);
    } catch (err) {
      next(err);
    }
  },

  async me(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = await authService.me(req.user!.userId, req.user!.deviceId ?? '');
      success(res, user);
    } catch (err) {
      next(err);
    }
  },

  async updateProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = await authService.updateProfile(
        req.user!.userId,
        req.user!.deviceId ?? '',
        req.body as { name?: string; employeeNumber?: string; position?: string; avatarUrl?: string },
      );
      success(res, user);
    } catch (err) {
      next(err);
    }
  },

  async listDevices(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const devices = await authService.listDevices(req.user!.userId, req.user!.deviceId ?? '');
      success(res, devices);
    } catch (err) {
      next(err);
    }
  },

  async renameDevice(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { deviceId } = req.params as { deviceId: string };
      const { name } = req.body as { name: string };
      const device = await authService.renameDevice(
        req.user!.userId,
        deviceId,
        name,
        req.user!.deviceId ?? '',
      );
      success(res, device);
    } catch (err) {
      next(err);
    }
  },

  async revokeDevice(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { deviceId } = req.params as { deviceId: string };
      const result = await authService.revokeDevice(
        req.user!.userId,
        deviceId,
        req.user!.deviceId ?? '',
      );
      success(res, result);
    } catch (err) {
      next(err);
    }
  },
};
