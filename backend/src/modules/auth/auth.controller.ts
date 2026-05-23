import { Request, Response, NextFunction } from 'express';
import { authService } from './auth.service';
import { success } from '../../shared/utils/response';

export const authController = {
  async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await authService.register(req.body as {
        email: string; password: string; name: string; schoolId: string; deviceId: string;
      });
      success(res, result, 201);
    } catch (err) {
      next(err);
    }
  },

  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await authService.login(req.body as {
        email: string; password: string; deviceId: string;
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
      const user = await authService.me(req.user!.userId);
      success(res, user);
    } catch (err) {
      next(err);
    }
  },
};
