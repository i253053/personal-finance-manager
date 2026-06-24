import { Router } from 'express';
import * as goalController from '../controllers/goal.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { validate } from '../middleware/validate.js';
import {
  contributeSchema,
  createGoalSchema,
  goalIdSchema,
  updateGoalSchema,
} from '../validators/goal.validator.js';

const router = Router();

router.use(authenticate);

router.get('/', goalController.list);
router.post('/', validate(createGoalSchema), goalController.create);
router.patch('/:id', validate(updateGoalSchema), goalController.update);
router.post('/:id/contribute', validate(contributeSchema), goalController.contribute);
router.delete('/:id', validate(goalIdSchema), goalController.remove);

export default router;
