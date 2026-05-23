import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import { validateBody } from '../../middleware/validate.middleware';
import { syncController } from './sync.controller';
import { pushSchema, pullSchema } from './sync.schema';

const router = Router();

router.use(authenticate);

router.post('/push',   validateBody(pushSchema),   syncController.push);
router.post('/pull',   validateBody(pullSchema),   syncController.pull);
router.get('/status',  syncController.getStatus);
router.get('/logs',    syncController.getLogs);

export { router as syncRouter };
