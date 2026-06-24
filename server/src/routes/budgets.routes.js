import { Router } from 'express';
import * as budgetController from '../controllers/budget.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { validate } from '../middleware/validate.js';
import {
  budgetIdSchema,
  copyBudgetsSchema,
  createBudgetSchema,
  listBudgetsSchema,
  updateBudgetSchema,
} from '../validators/budget.validator.js';

const router = Router();

router.use(authenticate);

router.get('/', validate(listBudgetsSchema), budgetController.list);
router.post('/', validate(createBudgetSchema), budgetController.create);
router.post('/copy', validate(copyBudgetsSchema), budgetController.copy);
router.patch('/:id', validate(updateBudgetSchema), budgetController.update);
router.delete('/:id', validate(budgetIdSchema), budgetController.remove);

export default router;
