import { Router } from 'express';
import { studentController } from './student.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { validateBody, validateParams, validateQuery } from '../../middleware/validate.middleware';
import {
  createStudentSchema,
  updateStudentSchema,
  transferStudentSchema,
  importStudentsSchema,
  listStudentsQuerySchema,
  studentIdParamSchema,
  lrnParamSchema,
} from './student.schema';

const router = Router();

router.use(authenticate);

router.get('/',                                    validateQuery(listStudentsQuerySchema), studentController.list);
router.post('/',                                   validateBody(createStudentSchema),      studentController.create);
router.post('/import',                             validateBody(importStudentsSchema),     studentController.bulkImport);
router.get('/lrn/:lrn',                            validateParams(lrnParamSchema),         studentController.getByLRN);
router.get('/:id',                                 validateParams(studentIdParamSchema),   studentController.getById);
router.put('/:id',                                 validateParams(studentIdParamSchema),   validateBody(updateStudentSchema), studentController.update);
router.post('/:id/transfer',                       validateParams(studentIdParamSchema),   validateBody(transferStudentSchema), studentController.transfer);
router.get('/:id/attendance-summary',              validateParams(studentIdParamSchema),   studentController.getAttendanceSummary);

export { router as studentRouter };
