import { Request, Response, NextFunction } from 'express';
import { attendanceService } from './attendance.service';
import { success, error } from '../../shared/utils/response';
import { logAudit } from '../../shared/utils/auditLog';

export const attendanceController = {
  async getByDate(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { classLoadId, date, session } = req.query as {
        classLoadId: string; date: string; session: string;
      };
      const records = await attendanceService.getByDate(classLoadId, date, session, req.user!.userId);
      if (records === null) {
        error(res, 'Class load not found', 404);
        return;
      }
      success(res, records);
    } catch (err) {
      next(err);
    }
  },

  async getSummary(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { classLoadId, startDate, endDate } = req.query as {
        classLoadId: string; startDate?: string; endDate?: string;
      };
      const summary = await attendanceService.getSummary(
        classLoadId, req.user!.userId, startDate, endDate,
      );
      if (summary === null) {
        error(res, 'Class load not found', 404);
        return;
      }
      success(res, summary);
    } catch (err) {
      next(err);
    }
  },

  async submit(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { records } = req.body as { records: Parameters<typeof attendanceService.submit>[0] };
      const result = await attendanceService.submit(records, req.user!.userId);
      const first = (records as Array<{ session?: string; classLoadId?: string }>)[0];
      void logAudit({
        schoolId:  req.user!.schoolId,
        actorId:   req.user!.userId,
        actorName: req.user!.name,
        action:    'attendance.save',
        target:    `Attendance · ${first?.session ?? ''}`,
        tone:      'save',
      });
      success(res, result, 201);
    } catch (err) {
      next(err);
    }
  },

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const record = await attendanceService.update(
        req.params.id as string,
        (req.body as { status: string }).status,
        req.user!.userId,
      );
      success(res, record);
    } catch (err) {
      next(err);
    }
  },

  async bulkSync(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { records } = req.body as { records: Parameters<typeof attendanceService.bulkSync>[0] };
      const result = await attendanceService.bulkSync(records, req.user!.userId);
      success(res, result);
    } catch (err) {
      next(err);
    }
  },

  async getSf2Sheet(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { classLoadId, month } = req.query as { classLoadId: string; month: string };
      const sheet = await attendanceService.getSf2Sheet(classLoadId, month, req.user!.userId);
      if (!sheet) { error(res, 'Class load not found', 404); return; }
      success(res, sheet);
    } catch (err) {
      next(err);
    }
  },
};
