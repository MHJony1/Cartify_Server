import { Router } from "express";
import { AdminController } from "./admin.controller";
import { auth } from "@/app/middleware/auth";
import { authorize } from "@/app/middleware/role";
import { UserRole } from "@/generated/prisma/enums";
import { validateRequest } from "@/app/middleware/validateRequest";
import { AdminValidation } from "./admin.validation";

const router = Router();

// Middleware to ensure all admin routes are authenticated and authorized
router.use(auth, authorize(UserRole.ADMIN));

router.get(
  "/dashboard",
  AdminController.getDashboardOverview
);

router.get(
  "/analytics/sales",
  validateRequest(AdminValidation.analyticsQuerySchema),
  AdminController.getSalesAnalytics
);

router.get(
  "/analytics/orders",
  validateRequest(AdminValidation.analyticsQuerySchema),
  AdminController.getOrderAnalytics
);

router.get(
  "/analytics/customers",
  validateRequest(AdminValidation.analyticsQuerySchema),
  AdminController.getCustomerAnalytics
);

router.get(
  "/analytics/products",
  validateRequest(AdminValidation.analyticsQuerySchema),
  AdminController.getProductAnalytics
);

router.get(
  "/analytics/inventory",
  AdminController.getInventoryAnalytics
);

router.get(
  "/analytics/payments",
  validateRequest(AdminValidation.analyticsQuerySchema),
  AdminController.getPaymentAnalytics
);

router.get(
  "/analytics/reviews",
  validateRequest(AdminValidation.analyticsQuerySchema),
  AdminController.getReviewAnalytics
);

router.get(
  "/analytics/coupons",
  validateRequest(AdminValidation.analyticsQuerySchema),
  AdminController.getCouponAnalytics
);

export const adminRoutes = router;
