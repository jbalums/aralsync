import { Request, Response, NextFunction } from 'express';
import { schoolService } from './school.service';
import { success } from '../../shared/utils/response';
import { logAudit } from '../../shared/utils/auditLog';

export const schoolController = {
  async listAll(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const schools = await schoolService.listAll();
      success(res, schools);
    } catch (err) {
      next(err);
    }
  },

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const school = await schoolService.createSchool(
        req.body as { name: string; schoolId: string; division: string; district?: string; address?: string },
      );
      success(res, school, 201);
    } catch (err) {
      next(err);
    }
  },

  async bulkCreate(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await schoolService.bulkCreateSchools(
        req.body as {
          division: string;
          district?: string;
          schools: Array<{ schoolId: string; name: string; address?: string }>;
        },
      );
      success(res, result, 201);
    } catch (err) {
      next(err);
    }
  },

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const school = await schoolService.updateSchool(
        req.params.id as string,
        req.body as Partial<{ name: string; schoolId: string; division: string; district: string; address: string }>,
      );
      success(res, school);
    } catch (err) {
      next(err);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const school = await schoolService.getById(req.params.id as string);
      success(res, school);
    } catch (err) {
      next(err);
    }
  },

  async updateInfo(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { role, schoolId } = req.user!;
      if (role !== 'super_admin' && schoolId !== req.params.id) {
        res.status(403).json({ message: 'Forbidden: not your school' });
        return;
      }
      const school = await schoolService.updateInfo(
        req.params.id as string,
        req.body as { division?: string; district?: string; address?: string },
      );
      success(res, school);
    } catch (err) {
      next(err);
    }
  },

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

  async updateYear(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const year = await schoolService.updateYear(
        req.params.id as string,
        req.params.yearId as string,
        req.body as { label?: string; startDate?: string; endDate?: string },
      );
      success(res, year);
    } catch (err) {
      next(err);
    }
  },

  async deleteYear(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await schoolService.deleteYear(
        req.params.id as string,
        req.params.yearId as string,
      );
      success(res, result);
    } catch (err) {
      next(err);
    }
  },

  async activateYear(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const year = await schoolService.activateYear(req.params.id as string, req.params.yearId as string);
      void logAudit({
        schoolId:  req.params.id as string,
        actorId:   req.user!.userId,
        actorName: req.user!.name,
        action:    'year.activate',
        target:    year.label,
        tone:      'lock',
      });
      success(res, year);
    } catch (err) {
      next(err);
    }
  },

  async getAdminSummary(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const summary = await schoolService.getAdminSummary(req.params.id as string);
      success(res, summary);
    } catch (err) {
      next(err);
    }
  },

  async getFaculty(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const faculty = await schoolService.getFaculty(req.params.id as string);
      success(res, faculty);
    } catch (err) {
      next(err);
    }
  },

  async getAllClasses(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const classes = await schoolService.getAllClasses(req.params.id as string);
      success(res, classes);
    } catch (err) {
      next(err);
    }
  },

  async getAuditLog(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const limit = req.query.limit ? Number(req.query.limit) : 50;
      const log = await schoolService.getAuditLog(req.params.id as string, limit);
      success(res, log);
    } catch (err) {
      next(err);
    }
  },

  async updateFacultyMember(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const member = await schoolService.updateFacultyMember(
        req.params.id as string,
        req.params.userId as string,
        req.body as { department?: string; position?: string },
      );
      success(res, member);
    } catch (err) {
      next(err);
    }
  },

  async updateFacultyRole(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { role } = req.body as { role: 'school_admin' | 'advisory_teacher' | 'subject_teacher' };
      const updated = await schoolService.updateFacultyRole(
        req.params.id as string,
        req.params.userId as string,
        role,
      );
      void logAudit({
        schoolId:  req.params.id as string,
        actorId:   req.user!.userId,
        actorName: req.user!.name,
        action:    'faculty.role-change',
        target:    `${updated.name} → ${updated.role}`,
        tone:      'security',
        metadata:  { userId: updated.id, newRole: updated.role },
      });
      success(res, updated);
    } catch (err) {
      next(err);
    }
  },

  async adminCreateClass(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { role, schoolId } = req.user!;
      if (role !== 'super_admin' && schoolId !== req.params.id) {
        res.status(403).json({ message: 'Forbidden: not your school' });
        return;
      }
      const result = await schoolService.adminCreateClass(
        req.params.id as string,
        req.body as Parameters<typeof schoolService.adminCreateClass>[1],
      );
      void logAudit({
        schoolId:  req.params.id as string,
        actorId:   req.user!.userId,
        actorName: req.user!.name,
        action:    'class.create',
        target:    `${result.subjectName} · ${result.sectionName} → ${result.teacherName}`,
        tone:      'create',
        metadata:  { classLoadId: result.id, teacherId: result.teacherId },
      });
      success(res, result, 201);
    } catch (err) {
      next(err);
    }
  },

  async adminUpdateClass(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { role, schoolId } = req.user!;
      if (role !== 'super_admin' && schoolId !== req.params.id) {
        res.status(403).json({ message: 'Forbidden: not your school' });
        return;
      }
      const result = await schoolService.adminUpdateClass(
        req.params.id as string,
        req.params.classId as string,
        req.body as Parameters<typeof schoolService.adminUpdateClass>[2],
      );
      void logAudit({
        schoolId:  req.params.id as string,
        actorId:   req.user!.userId,
        actorName: req.user!.name,
        action:    'class.update',
        target:    `${result.subjectName} · ${result.sectionName}`,
        tone:      'edit',
        metadata:  { classLoadId: result.id },
      });
      success(res, result);
    } catch (err) {
      next(err);
    }
  },

  async adminAssignTeacher(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { role, schoolId } = req.user!;
      if (role !== 'super_admin' && schoolId !== req.params.id) {
        res.status(403).json({ message: 'Forbidden: not your school' });
        return;
      }
      const { teacherId } = req.body as { teacherId: string };
      const result = await schoolService.adminAssignTeacher(
        req.params.id as string,
        req.params.classId as string,
        teacherId,
      );
      void logAudit({
        schoolId:  req.params.id as string,
        actorId:   req.user!.userId,
        actorName: req.user!.name,
        action:    'class.reassign',
        target:    `${result.subjectName} · ${result.sectionName} → ${result.teacherName}`,
        tone:      'edit',
        metadata:  { classLoadId: result.id, teacherId: result.teacherId, previousTeacherId: result.previousTeacherId },
      });
      success(res, result);
    } catch (err) {
      next(err);
    }
  },

  async adminDeleteClass(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { role, schoolId } = req.user!;
      if (role !== 'super_admin' && schoolId !== req.params.id) {
        res.status(403).json({ message: 'Forbidden: not your school' });
        return;
      }
      const result = await schoolService.adminDeleteClass(
        req.params.id as string,
        req.params.classId as string,
      );
      void logAudit({
        schoolId:  req.params.id as string,
        actorId:   req.user!.userId,
        actorName: req.user!.name,
        action:    'class.delete',
        target:    `${result.subjectName} · ${result.sectionName}`,
        tone:      'lock',
        metadata:  { classLoadId: result.id },
      });
      success(res, result);
    } catch (err) {
      next(err);
    }
  },

  async assignClassLoad(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { classLoadId } = req.body as { classLoadId: string };
      const result = await schoolService.assignClassLoad(
        req.params.id as string,
        req.params.userId as string,
        classLoadId,
      );
      void logAudit({
        schoolId:  req.params.id as string,
        actorId:   req.user!.userId,
        actorName: req.user!.name,
        action:    'faculty.class-assign',
        target:    `Class assigned to faculty`,
        tone:      'edit',
        metadata:  result,
      });
      success(res, result);
    } catch (err) {
      next(err);
    }
  },
};
