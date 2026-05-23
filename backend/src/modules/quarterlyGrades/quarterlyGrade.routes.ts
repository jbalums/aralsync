import { Router } from 'express';
import { quarterlyGradeController } from './quarterlyGrade.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { validateBody, validateQuery } from '../../middleware/validate.middleware';
import { quarterlyGradeQuerySchema, classLoadQuarterSchema, reportCardQuerySchema } from './quarterlyGrade.schema';

const router = Router();

router.use(authenticate);

router.get('/class-report', validateQuery(quarterlyGradeQuerySchema), quarterlyGradeController.getClassReport);
router.get('/report-card',  validateQuery(reportCardQuerySchema),      quarterlyGradeController.getReportCard);
router.get('/',             validateQuery(quarterlyGradeQuerySchema), quarterlyGradeController.get);
router.post('/compute',     validateBody(classLoadQuarterSchema),     quarterlyGradeController.compute);
router.post('/finalize',    validateBody(classLoadQuarterSchema),     quarterlyGradeController.finalize);

export { router as quarterlyGradeRouter };
