import { Router } from 'express';
import { schoolController } from './school.controller';
import { authenticate, authorize } from '../../middleware/auth.middleware';
import { validateBody, validateParams } from '../../middleware/validate.middleware';
import {
  createSchoolYearSchema,
  createSchoolSchema,
  updateSchoolSchema,
  updateSchoolInfoSchema,
  bulkCreateSchoolsSchema,
  schoolIdParamSchema,
  yearIdParamSchema,
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

export { router as schoolRouter };
