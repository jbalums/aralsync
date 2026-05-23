import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import { validateBody, validateParams } from '../../middleware/validate.middleware';
import { scheduleController } from './schedule.controller';
import {
  createScheduleSchema,
  updateScheduleSchema,
  checkConflictSchema,
  scheduleIdParamSchema,
} from './schedule.schema';

const router = Router();

router.use(authenticate);

router.get('/weekly',           scheduleController.getWeekly);
router.post('/',                validateBody(createScheduleSchema),    scheduleController.create);
router.post('/check-conflict',  validateBody(checkConflictSchema),     scheduleController.checkConflict);
router.put('/:id',              validateParams(scheduleIdParamSchema), validateBody(updateScheduleSchema), scheduleController.update);
router.delete('/:id',           validateParams(scheduleIdParamSchema), scheduleController.delete);

export { router as scheduleRouter };
