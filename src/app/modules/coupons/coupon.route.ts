import { Router } from "express";
import * as couponController from "./coupon.controller";
import { auth } from "@/app/middleware/auth";
import { validateRequest } from "@/app/middleware/validateRequest";
import { CouponValidation } from "./coupon.validation";
import { authorize } from "@/app/middleware/role";
import { UserRole } from "@/generated/prisma/enums";

const router = Router();

// Admin routes
router.post(
  "/",
  auth,
  authorize(UserRole.ADMIN),
  validateRequest(CouponValidation.createCouponSchema),
  couponController.createCoupon
);

router.get(
  "/",
  auth,
  authorize(UserRole.ADMIN),
  couponController.getAllCoupons
);

router.get(
  "/:id",
  auth,
  authorize(UserRole.ADMIN),
  couponController.getCouponById
);

router.patch(
  "/:id",
  auth,
  authorize(UserRole.ADMIN),
  validateRequest(CouponValidation.updateCouponSchema),
  couponController.updateCoupon
);

router.delete(
  "/:id",
  auth,
  authorize(UserRole.ADMIN),
  couponController.deleteCoupon
);

router.patch(
  "/:id/toggle-status",
  auth,
  authorize(UserRole.ADMIN),
  couponController.toggleStatus
);

// User routes
router.post(
  "/apply",
  auth,
  validateRequest(CouponValidation.applyCouponSchema),
  couponController.applyCoupon
);

export const couponRoutes = router;
