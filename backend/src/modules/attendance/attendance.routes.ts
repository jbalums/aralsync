import { Router } from 'express';
import { attendanceController } from './attendance.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { validateBody, validateQuery, validateParams } from '../../middleware/validate.middleware';
import {
  byDateQuerySchema,
  summaryQuerySchema,
  submitAttendanceSchema,
  updateAttendanceSchema,
  bulkSyncSchema,
  attendanceIdParamSchema,
  sf2SheetQuerySchema,
} from './attendance.schema';

const router = Router();

router.use(authenticate);

router.get('/by-date',    validateQuery(byDateQuerySchema),     attendanceController.getByDate);
router.get('/summary',    validateQuery(summaryQuerySchema),    attendanceController.getSummary);
router.get('/sf2-sheet',  validateQuery(sf2SheetQuerySchema),   attendanceController.getSf2Sheet);
router.post('/',          validateBody(submitAttendanceSchema), attendanceController.submit);
router.put('/:id',        validateParams(attendanceIdParamSchema), validateBody(updateAttendanceSchema), attendanceController.update);
router.post('/bulk-sync', validateBody(bulkSyncSchema),         attendanceController.bulkSync);

export { router as attendanceRouter };
