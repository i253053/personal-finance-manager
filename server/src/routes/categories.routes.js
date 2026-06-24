import { Router } from 'express';
import * as categoryController from '../controllers/category.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { validate } from '../middleware/validate.js';
import {
  categoryIdSchema,
  createCategorySchema,
  updateCategorySchema,
} from '../validators/category.validator.js';

const router = Router();

router.use(authenticate);

router.get('/', categoryController.list);
router.post('/', validate(createCategorySchema), categoryController.create);
router.get('/:id', validate(categoryIdSchema), categoryController.getOne);
router.patch('/:id', validate(updateCategorySchema), categoryController.update);
router.delete('/:id', validate(categoryIdSchema), categoryController.remove);

export default router;
