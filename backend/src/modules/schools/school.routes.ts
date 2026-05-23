import { Router } from 'express';
import { schoolController } from './school.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { validateBody, validateParams } from '../../middleware/validate.middleware';
import { createSchoolYearSchema, schoolIdParamSchema, yearIdParamSchema } from './school.schema';

const router = Router();

router.use(authenticate);

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
