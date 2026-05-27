import { Request, Response, NextFunction } from 'express';
import { studentService } from './student.service';
import { success, error } from '../../shared/utils/response';
import { logAudit } from '../../shared/utils/auditLog';

export const studentController = {
  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await studentService.listForTeacher(req.user!.userId, {
        q:           req.query.q as string | undefined,
        classLoadId: req.query.classLoadId as string | undefined,
        page:        Number(req.query.page ?? 1),
        limit:       Number(req.query.limit ?? 50),
      });
      success(res, result.students, 200, {
        total: result.total,
        page:  result.page,
        pages: result.pages,
      });
    } catch (err) {
      next(err);
    }
  },

  async getByLRN(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const student = await studentService.getByLRN(
        req.params.lrn as string,
        req.user!.schoolId ?? '',
      );
      if (!student) {
        error(res, 'Student not found', 404);
        return;
      }
      success(res, student);
    } catch (err) {
      next(err);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const student = await studentService.getById(req.params.id as string, req.user!.userId);
      if (!student) {
        error(res, 'Student not found', 404);
        return;
      }
      success(res, student);
    } catch (err) {
      next(err);
    }
  },

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const student = await studentService.create(
        req.body as Parameters<typeof studentService.create>[0],
        req.user!.userId,
      );
      void logAudit({
        schoolId:  req.user!.schoolId,
        actorId:   req.user!.userId,
        actorName: req.user!.name,
        action:    'student.create',
        target:    `${(req.body as { firstName?: string; lastName?: string }).firstName ?? ''} ${(req.body as { lastName?: string }).lastName ?? ''}`.trim(),
        tone:      'create',
      });
      success(res, student, 201);
    } catch (err) {
      next(err);
    }
  },

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const student = await studentService.update(
        req.params.id as string,
        req.body as Parameters<typeof studentService.update>[1],
        req.user!.userId,
      );
      success(res, student);
    } catch (err) {
      next(err);
    }
  },

  async remove(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await studentService.deactivate(req.params.id as string, req.user!.userId);
      success(res, { deleted: true });
    } catch (err) {
      next(err);
    }
  },

  async transfer(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const student = await studentService.transfer(
        req.params.id as string,
        (req.body as { classLoadId: string }).classLoadId,
        req.user!.userId,
      );
      success(res, student);
    } catch (err) {
      next(err);
    }
  },

  async bulkImport(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { classLoadId, students } = req.body as {
        classLoadId: string;
        students: Parameters<typeof studentService.bulkImport>[1];
      };
      const result = await studentService.bulkImport(classLoadId, students, req.user!.userId);
      const count = Array.isArray(students) ? students.length : 0;
      void logAudit({
        schoolId:  req.user!.schoolId,
        actorId:   req.user!.userId,
        actorName: req.user!.name,
        action:    'student.import',
        target:    `${count} student${count !== 1 ? 's' : ''} imported`,
        tone:      'create',
      });
      success(res, result);
    } catch (err) {
      next(err);
    }
  },

  async getAttendanceSummary(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const summary = await studentService.getAttendanceSummary(
        req.params.id as string,
        req.user!.userId,
      );
      if (!summary) {
        error(res, 'Student not found', 404);
        return;
      }
      success(res, summary);
    } catch (err) {
      next(err);
    }
  },

  async getAttendanceRecords(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await studentService.getAttendanceRecords(
        req.params.id as string,
        req.user!.userId,
        {
          page:      Number(req.query.page  ?? 1),
          limit:     Number(req.query.limit ?? 20),
          startDate: req.query.startDate as string | undefined,
          endDate:   req.query.endDate   as string | undefined,
          session:   req.query.session   as string | undefined,
          status:    req.query.status    as string | undefined,
        },
      );
      if (!result) {
        error(res, 'Student not found', 404);
        return;
      }
      success(res, result.records, 200, result.meta);
    } catch (err) {
      next(err);
    }
  },
};
