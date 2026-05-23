import { Request, Response, NextFunction } from 'express';
import { schoolService } from './school.service';
import { success } from '../../shared/utils/response';

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
