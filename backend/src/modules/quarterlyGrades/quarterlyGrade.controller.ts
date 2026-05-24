import { Request, Response, NextFunction } from 'express';
import { quarterlyGradeService } from './quarterlyGrade.service';
import { success, error } from '../../shared/utils/response';
import { logAudit } from '../../shared/utils/auditLog';

export const quarterlyGradeController = {
  async get(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { classLoadId, quarter } = req.query as { classLoadId: string; quarter: string };
      const grades = await quarterlyGradeService.get(classLoadId, quarter, req.user!.userId);
      if (!grades) { error(res, 'Class load not found', 404); return; }
      success(res, grades);
    } catch (err) { next(err); }
  },

  async compute(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { classLoadId, quarter } = req.body as { classLoadId: string; quarter: string };
      const result = await quarterlyGradeService.compute(classLoadId, quarter, req.user!.userId);
      success(res, result);
    } catch (err) { next(err); }
  },

  async finalize(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { classLoadId, quarter } = req.body as { classLoadId: string; quarter: string };
      const result = await quarterlyGradeService.finalize(classLoadId, quarter, req.user!.userId);
      void logAudit({
        schoolId:  req.user!.schoolId,
        actorId:   req.user!.userId,
        actorName: req.user!.name,
        action:    'grade.finalize',
        target:    `Quarterly grades · ${quarter}`,
        tone:      'lock',
      });
      success(res, result);
    } catch (err) { next(err); }
  },

  async getClassReport(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { classLoadId, quarter } = req.query as { classLoadId: string; quarter: string };
      const report = await quarterlyGradeService.getClassReport(classLoadId, quarter, req.user!.userId);
      if (!report) { error(res, 'Class load not found', 404); return; }
      success(res, report);
    } catch (err) { next(err); }
  },

  async getReportCard(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { studentId, schoolYearId } = req.query as { studentId: string; schoolYearId: string };
      const card = await quarterlyGradeService.getReportCard(studentId, schoolYearId);
      if (!card) { error(res, 'Student not found', 404); return; }
      success(res, card);
    } catch (err) { next(err); }
  },
};
