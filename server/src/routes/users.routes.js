import { Router } from 'express';
import * as authController from '../controllers/auth.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { validate } from '../middleware/validate.js';
import { updateUserSchema } from '../validators/auth.validator.js';

const router = Router();

router.use(authenticate);

router.get('/me', authController.getMe);
router.patch('/me', validate(updateUserSchema), authController.updateMe);
router.delete('/me', authController.deleteMe);

export default router;
