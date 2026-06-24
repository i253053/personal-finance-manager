import { Router } from 'express';
import * as recurringController from '../controllers/recurring.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { validate } from '../middleware/validate.js';
import {
  createRecurringSchema,
  recurringIdSchema,
  updateRecurringSchema,
} from '../validators/recurring.validator.js';

const router = Router();

router.use(authenticate);

router.get('/', recurringController.list);
router.post('/process', recurringController.process);
router.post('/', validate(createRecurringSchema), recurringController.create);
router.patch('/:id', validate(updateRecurringSchema), recurringController.update);
router.delete('/:id', validate(recurringIdSchema), recurringController.remove);

export default router;
