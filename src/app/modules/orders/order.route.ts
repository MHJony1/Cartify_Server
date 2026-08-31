import { Router } from "express";
import { orderController } from "./order.controller";
import { auth } from "@/app/middleware/auth";
import { authorize } from "@/app/middleware/role";
import { UserRole } from "@/generated/prisma/enums";
import { validateRequest } from "@/app/middleware/validateRequest";
import { orderValidation } from "./order.validation";

const router = Router();

router.post(
  "/",
  auth,
  validateRequest(orderValidation.createOrderValidationSchema),
  orderController.createOrder
);
router.get(
  "/my-orders",
  auth,
  orderController.getMyOrders
);

router.get(
  "/",
  auth,
  authorize(UserRole.ADMIN),
  orderController.getAllOrders
);

router.get(
  "/admin/:id",
  auth,
  authorize(UserRole.ADMIN),
  orderController.adminGetSingleOrder
);

router.get(
  "/:id",
  auth,
  orderController.getSingleOrder
);

router.patch(
  "/:id/status",
  auth,
  authorize(UserRole.ADMIN),
  validateRequest(orderValidation.updateOrderStatusSchema),
  orderController.updateOrderStatus
);

router.patch(
  "/:id/cancel",
  auth,
  orderController.cancelOrder
);

router.patch(
  "/:id/payment-status",
  auth,
  authorize(UserRole.ADMIN),
  validateRequest(orderValidation.updatePaymentStatusSchema),
  orderController.updatePaymentStatus
);

export const orderRoutes = router;