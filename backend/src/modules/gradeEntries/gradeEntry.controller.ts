import { Request, Response, NextFunction } from 'express';
import { gradeEntryService } from './gradeEntry.service';
import { success, error } from '../../shared/utils/response';

export const gradeEntryController = {
  async getMatrix(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { classLoadId, quarter } = req.query as { classLoadId: string; quarter: string };
      const matrix = await gradeEntryService.getMatrix(classLoadId, quarter, req.user!.userId);
      if (!matrix) {
        error(res, 'Class load not found', 404);
        return;
      }
      success(res, matrix);
    } catch (err) {
      next(err);
    }
  },

  async bulkSave(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { classLoadId, quarter, entries } = req.body as {
        classLoadId: string;
        quarter:     string;
        entries:     Parameters<typeof gradeEntryService.bulkSave>[2];
      };
      const result = await gradeEntryService.bulkSave(classLoadId, quarter, entries, req.user!.userId);
      success(res, result, 201);
    } catch (err) {
      next(err);
    }
  },
};
