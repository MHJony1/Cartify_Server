import { Router } from "express";

import * as productController
  from "./product.controller";
import { auth } from "@/app/middleware/auth";
import { authorize } from "@/app/middleware/role";
import { validateRequest } from "@/app/middleware/validateRequest";
import { UserRole } from "@/generated/prisma/enums";
import { createProductSchema, updateProductSchema } from "./product.validatoin";


const router = Router();

router.get(
  "/",
  productController.getProducts
);

router.get(
  "/:id",
  productController.getProductById
);

router.post(
  "/",
  auth,
  authorize(UserRole.ADMIN),
  validateRequest(createProductSchema),
  productController.createProduct
);

router.patch(
  "/:id",
  auth,
  authorize(UserRole.ADMIN),
  validateRequest(updateProductSchema),
  productController.updateProduct
);

router.delete(
  "/:id",
  auth,
  authorize(UserRole.ADMIN),
  productController.deleteProduct
);

export default router;