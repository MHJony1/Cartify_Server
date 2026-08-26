import { Router } from "express";
import { InventoryController } from "./inventory.controller";
import { auth } from "@/app/middleware/auth";
import { authorize } from "@/app/middleware/role";
import { UserRole } from "@/generated/prisma/enums";
import { validateRequest } from "@/app/middleware/validateRequest";
import { InventoryValidation } from "./inventory.validation";

const router = Router();

router.get(
  "/",
  auth,
  authorize(UserRole.ADMIN),
  InventoryController.getInventory
);

router.get(
  "/:productId",
  auth,
  authorize(UserRole.ADMIN),
  InventoryController.getInventoryDetails
);

router.get(
  "/:productId/history",
  auth,
  authorize(UserRole.ADMIN),
  InventoryController.getInventoryHistory
);

router.patch(
  "/:productId/restock",
  auth,
  authorize(UserRole.ADMIN),
  validateRequest(InventoryValidation.restockSchema),
  InventoryController.restock
);

router.patch(
  "/:productId/damage",
  auth,
  authorize(UserRole.ADMIN),
  validateRequest(InventoryValidation.damageSchema),
  InventoryController.damage
);

router.patch(
  "/:productId/adjust",
  auth,
  authorize(UserRole.ADMIN),
  validateRequest(InventoryValidation.adjustSchema),
  InventoryController.adjust
);

export const inventoryRoutes = router;
