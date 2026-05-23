import { Router } from 'express';
import { classLoadController } from './classLoad.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { validateBody, validateParams } from '../../middleware/validate.middleware';
import { createClassLoadSchema, classLoadIdSchema } from './classLoad.schema';

const router = Router();

router.use(authenticate);

router.get('/', classLoadController.list);
router.post('/', validateBody(createClassLoadSchema), classLoadController.create);
router.get('/:id', validateParams(classLoadIdSchema), classLoadController.getById);
router.get('/:id/students', validateParams(classLoadIdSchema), classLoadController.getStudents);

export { router as classLoadRouter };
