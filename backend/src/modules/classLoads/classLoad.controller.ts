import { Request, Response, NextFunction } from 'express';
import { classLoadService } from './classLoad.service';
import { success, error } from '../../shared/utils/response';
import { logAudit } from '../../shared/utils/auditLog';

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
      void logAudit({
        schoolId:  req.user!.schoolId,
        actorId:   req.user!.userId,
        actorName: req.user!.name,
        action:    'class.create',
        target:    `New class load created`,
        tone:      'create',
        metadata:  { classLoadId: load.id },
      });
      success(res, load, 201);
    } catch (err) {
      next(err);
    }
  },

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const load = await classLoadService.update(
        req.params.id as string,
        req.user!.userId,
        req.body as Parameters<typeof classLoadService.update>[2],
      );
      success(res, load);
    } catch (err) {
      next(err);
    }
  },
};
