import { Router } from 'express';

import * as categoryController from './category.controller';
import { validateRequest } from '@/app/middleware/validateRequest';
import { auth } from '@/app/middleware/auth';
import { UserRole } from '@/generated/prisma/enums';

import {
  createCategorySchema,
  updateCategorySchema,
} from './category.validation';

const router = Router();

router.post(
  '/',
  auth(UserRole.ADMIN),
  validateRequest(createCategorySchema),
  categoryController.createCategory,
);

router.get('/', categoryController.getCategories);

router.get('/:id', categoryController.getCategoryById);

router.patch(
  '/:id',
  auth(UserRole.ADMIN),
  validateRequest(updateCategorySchema),
  categoryController.updateCategory,
);

router.delete('/:id', auth(UserRole.ADMIN), categoryController.deleteCategory);

export default router;
