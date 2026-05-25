import { Router } from 'express';
import { authController } from './auth.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { validateBody } from '../../middleware/validate.middleware';
import {
  registerSchema,
  loginSchema,
  refreshSchema,
  logoutSchema,
  updateProfileSchema,
  renameDeviceSchema,
} from './auth.schema';

const router = Router();

router.post('/register', validateBody(registerSchema), authController.register);
router.post('/login',    validateBody(loginSchema),    authController.login);
router.post('/refresh',  validateBody(refreshSchema),  authController.refresh);
router.post('/logout',   validateBody(logoutSchema),   authController.logout);
router.get('/me',        authenticate,                 authController.me);
router.patch('/me',      authenticate, validateBody(updateProfileSchema), authController.updateProfile);

router.get('/devices',                authenticate,                                  authController.listDevices);
router.patch('/devices/:deviceId',    authenticate, validateBody(renameDeviceSchema), authController.renameDevice);
router.delete('/devices/:deviceId',   authenticate,                                  authController.revokeDevice);

export { router as authRouter };
