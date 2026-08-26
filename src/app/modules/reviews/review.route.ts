import { Router } from "express";
import { reviewController } from "./review.controller";
import { auth } from "@/app/middleware/auth";
import { authorize } from "@/app/middleware/role";
import { UserRole } from "@/generated/prisma/enums";
import { validateRequest } from "@/app/middleware/validateRequest";
import { reviewValidation } from "./review.validation";

const router = Router();

router.post(
  "/",
  auth,
  validateRequest(reviewValidation.createReviewSchema),
  reviewController.createReview
);

router.get(
  "/product/:productId",
  reviewController.getProductReviews
);

router.get(
  "/my-reviews",
  auth,
  reviewController.getMyReviews
);

router.patch(
  "/:id",
  auth,
  validateRequest(reviewValidation.updateReviewSchema),
  reviewController.updateReview
);

router.delete(
  "/:id",
  auth,
  reviewController.deleteReview
);

router.get(
  "/",
  auth,
  authorize(UserRole.ADMIN),
  reviewController.getAllReviews
);

export const reviewRoutes = router;
