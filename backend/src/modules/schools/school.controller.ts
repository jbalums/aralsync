import { Request, Response, NextFunction } from 'express';
import { schoolService } from './school.service';
import { success } from '../../shared/utils/response';

export const schoolController = {
  async getYears(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const years = await schoolService.getYears(req.params.id as string);
      success(res, years);
    } catch (err) {
      next(err);
    }
  },

  async createYear(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const year = await schoolService.createYear(
        req.params.id as string,
        req.body as { label: string; startDate: string; endDate: string },
      );
      success(res, year, 201);
    } catch (err) {
      next(err);
    }
  },

  async activateYear(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const year = await schoolService.activateYear(req.params.id as string, req.params.yearId as string);
      success(res, year);
    } catch (err) {
      next(err);
    }
  },
};
