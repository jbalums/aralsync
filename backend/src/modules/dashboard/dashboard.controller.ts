import { Request, Response, NextFunction } from 'express';
import { dashboardService } from './dashboard.service';
import { success } from '../../shared/utils/response';

export const dashboardController = {
  async getSummary(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await dashboardService.getSummary(req.user!.userId);
      success(res, data);
    } catch (err) {
      next(err);
    }
  },
};
