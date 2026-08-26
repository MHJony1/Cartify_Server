import { Router } from "express";
import * as paymentController from "./payment.controller";
import { auth } from "@/app/middleware/auth";
import { validateRequest } from "@/app/middleware/validateRequest";
import { PaymentValidation } from "./payment.validation";
import { authorize } from "@/app/middleware/role";

const router = Router();

// User routes
router.post(
  "/create",
  auth,
  validateRequest(PaymentValidation.createPaymentSchema),
  paymentController.createPayment
);

router.get(
  "/my-payments",
  auth,
  paymentController.getMyPayments
);

router.get(
  "/:id",
  auth,
  paymentController.getPaymentById
);

// Admin routes
router.get(
  "/",
  auth,
  authorize("ADMIN" as any),
  paymentController.getAllPayments
);

router.patch(
  "/:id/status",
  auth,
  authorize("ADMIN" as any),
  validateRequest(PaymentValidation.updatePaymentStatusSchema),
  paymentController.updatePaymentStatus
);

export const paymentRoutes = router;
