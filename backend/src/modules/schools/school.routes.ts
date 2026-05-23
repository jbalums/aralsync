import { Router } from 'express';
import { schoolController } from './school.controller';
import { authenticate, authorize } from '../../middleware/auth.middleware';
import { validateBody, validateParams } from '../../middleware/validate.middleware';
import {
  createSchoolYearSchema,
  createSchoolSchema,
  updateSchoolSchema,
  schoolIdParamSchema,
  yearIdParamSchema,
} from './school.schema';
import { Role } from '../../shared/types';

const router = Router();

router.use(authenticate);

// Super-admin school management
router.get('/', authorize(Role.SUPER_ADMIN), schoolController.listAll);
router.post('/', authorize(Role.SUPER_ADMIN), validateBody(createSchoolSchema), schoolController.create);
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
