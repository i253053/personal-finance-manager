import { Router } from 'express';
import * as transactionController from '../controllers/transaction.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { validate } from '../middleware/validate.js';
import {
  createTransactionSchema,
  listTransactionsSchema,
  transactionIdSchema,
  updateTransactionSchema,
} from '../validators/transaction.validator.js';

const router = Router();

router.use(authenticate);

router.get('/recent', transactionController.recent);
router.get('/', validate(listTransactionsSchema), transactionController.list);
router.post('/', validate(createTransactionSchema), transactionController.create);
router.get('/:id', validate(transactionIdSchema), transactionController.getOne);
router.patch('/:id', validate(updateTransactionSchema), transactionController.update);
router.delete('/:id', validate(transactionIdSchema), transactionController.remove);

export default router;
