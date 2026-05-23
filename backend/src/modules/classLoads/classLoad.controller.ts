import { Request, Response, NextFunction } from 'express';
import { classLoadService } from './classLoad.service';
import { success, error } from '../../shared/utils/response';

export const classLoadController = {
  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const loads = await classLoadService.listForTeacher(req.user!.userId);
      success(res, loads);
    } catch (err) {
      next(err);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const load = await classLoadService.getById(req.params.id as string, req.user!.userId);
      if (!load) {
        error(res, 'Class load not found', 404);
        return;
      }
      success(res, load);
    } catch (err) {
      next(err);
    }
  },

  async getStudents(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const students = await classLoadService.getStudents(req.params.id as string, req.user!.userId);
      if (!students) {
        error(res, 'Class load not found', 404);
        return;
      }
      success(res, students);
    } catch (err) {
      next(err);
    }
  },

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const load = await classLoadService.create(
        req.user!.userId,
        req.body as Parameters<typeof classLoadService.create>[1],
      );
      success(res, load, 201);
    } catch (err) {
      next(err);
    }
  },
};
