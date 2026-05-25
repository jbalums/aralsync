import { Router } from 'express';
import { schoolController } from './school.controller';
import { authenticate, authorize } from '../../middleware/auth.middleware';
import { validateBody, validateParams } from '../../middleware/validate.middleware';
import {
  createSchoolYearSchema,
  updateSchoolYearSchema,
  createSchoolSchema,
  updateSchoolSchema,
  updateSchoolInfoSchema,
  bulkCreateSchoolsSchema,
  schoolIdParamSchema,
  yearIdParamSchema,
  updateFacultySchema,
  updateFacultyRoleSchema,
  assignClassLoadSchema,
  facultyUserParamSchema,
  adminCreateClassSchema,
  adminUpdateClassSchema,
  assignTeacherSchema,
  classIdParamSchema,
} from './school.schema';
import { Role } from '../../shared/types';

const router = Router();

router.use(authenticate);

// All authenticated users — read/update own school
router.get('/:id', validateParams(schoolIdParamSchema), schoolController.getById);
router.patch('/:id/info', validateParams(schoolIdParamSchema), validateBody(updateSchoolInfoSchema), schoolController.updateInfo);

// Super-admin school management
router.get('/', authorize(Role.SUPER_ADMIN), schoolController.listAll);
router.post('/', authorize(Role.SUPER_ADMIN), validateBody(createSchoolSchema), schoolController.create);
router.post('/bulk', authorize(Role.SUPER_ADMIN), validateBody(bulkCreateSchoolsSchema), schoolController.bulkCreate);
router.put('/:id', authorize(Role.SUPER_ADMIN), validateParams(schoolIdParamSchema), validateBody(updateSchoolSchema), schoolController.update);

// School year management
router.get('/:id/years', validateParams(schoolIdParamSchema), schoolController.getYears);
router.post(
  '/:id/years',
  validateParams(schoolIdParamSchema),
  validateBody(createSchoolYearSchema),
  schoolController.createYear,
);
router.put(
  '/:id/years/:yearId/activate',
  validateParams(yearIdParamSchema),
  schoolController.activateYear,
);
router.put(
  '/:id/years/:yearId',
  validateParams(yearIdParamSchema),
  validateBody(updateSchoolYearSchema),
  schoolController.updateYear,
);
router.delete(
  '/:id/years/:yearId',
  validateParams(yearIdParamSchema),
  schoolController.deleteYear,
);

// Admin-level school views
router.get('/:id/admin-summary',  validateParams(schoolIdParamSchema), schoolController.getAdminSummary);
router.get('/:id/faculty',        validateParams(schoolIdParamSchema), schoolController.getFaculty);
router.get('/:id/classes',        validateParams(schoolIdParamSchema), schoolController.getAllClasses);
router.get('/:id/audit-log',      validateParams(schoolIdParamSchema), schoolController.getAuditLog);
router.patch(
  '/:id/faculty/:userId',
  validateParams(facultyUserParamSchema),
  validateBody(updateFacultySchema),
  schoolController.updateFacultyMember,
);
router.patch(
  '/:id/faculty/:userId/role',
  authorize(Role.SCHOOL_ADMIN, Role.SUPER_ADMIN),
  validateParams(facultyUserParamSchema),
  validateBody(updateFacultyRoleSchema),
  schoolController.updateFacultyRole,
);
router.post(
  '/:id/faculty/:userId/class-assignments',
  authorize(Role.SCHOOL_ADMIN, Role.SUPER_ADMIN),
  validateParams(facultyUserParamSchema),
  validateBody(assignClassLoadSchema),
  schoolController.assignClassLoad,
);

// Admin class management — restricted to school_admin and super_admin
router.post(
  '/:id/classes',
  authorize(Role.SCHOOL_ADMIN, Role.SUPER_ADMIN),
  validateParams(schoolIdParamSchema),
  validateBody(adminCreateClassSchema),
  schoolController.adminCreateClass,
);
router.patch(
  '/:id/classes/:classId',
  authorize(Role.SCHOOL_ADMIN, Role.SUPER_ADMIN),
  validateParams(classIdParamSchema),
  validateBody(adminUpdateClassSchema),
  schoolController.adminUpdateClass,
);
router.patch(
  '/:id/classes/:classId/teacher',
  authorize(Role.SCHOOL_ADMIN, Role.SUPER_ADMIN),
  validateParams(classIdParamSchema),
  validateBody(assignTeacherSchema),
  schoolController.adminAssignTeacher,
);
router.delete(
  '/:id/classes/:classId',
  authorize(Role.SCHOOL_ADMIN, Role.SUPER_ADMIN),
  validateParams(classIdParamSchema),
  schoolController.adminDeleteClass,
);

export { router as schoolRouter };
