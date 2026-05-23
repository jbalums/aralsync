import { Router } from 'express';
import { gradeEntryController } from './gradeEntry.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { validateBody, validateQuery } from '../../middleware/validate.middleware';
import { matrixQuerySchema, bulkSaveSchema } from './gradeEntry.schema';

const router = Router();

router.use(authenticate);

router.get('/matrix', validateQuery(matrixQuerySchema), gradeEntryController.getMatrix);
router.post('/bulk',  validateBody(bulkSaveSchema),      gradeEntryController.bulkSave);

export { router as gradeEntryRouter };
