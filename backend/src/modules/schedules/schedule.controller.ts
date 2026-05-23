import type { Request, Response, NextFunction } from 'express';
import { scheduleService } from './schedule.service';

export const scheduleController = {
  async getWeekly(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const items = await scheduleService.getWeekly(req.user!.userId);
      res.json({ success: true, data: items });
    } catch (err) { next(err); }
  },

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const item = await scheduleService.create(req.user!.userId, req.body as Parameters<typeof scheduleService.create>[1]);
      res.status(201).json({ success: true, data: item });
    } catch (err) { next(err); }
  },

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params['id'] as string;
      const item = await scheduleService.update(id, req.user!.userId, req.body as Parameters<typeof scheduleService.update>[2]);
      res.json({ success: true, data: item });
    } catch (err) { next(err); }
  },

  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params['id'] as string;
      await scheduleService.delete(id, req.user!.userId);
      res.json({ success: true, data: null });
    } catch (err) { next(err); }
  },

  async checkConflict(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { dayOfWeek, startH, startM, durMin, excludeId } = req.body as {
        dayOfWeek: number; startH: number; startM: number; durMin: number; excludeId?: string;
      };
      const conflicts = await scheduleService.checkConflict(
        req.user!.userId, dayOfWeek, startH, startM, durMin, excludeId,
      );
      res.json({ success: true, data: { conflicts, hasConflict: conflicts.length > 0 } });
    } catch (err) { next(err); }
  },
};
