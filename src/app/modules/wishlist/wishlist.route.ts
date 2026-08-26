import { Router } from "express";
import * as wishlistController from "./wishlist.controller";
import { auth } from "@/app/middleware/auth";
import { validateRequest } from "@/app/middleware/validateRequest";
import { WishlistValidation } from "./wishlist.validation";

const router = Router();

router.post(
  "/:productId",
  auth,
  validateRequest(WishlistValidation.addWishlistSchema),
  wishlistController.addToWishlist
);

router.get(
  "/",
  auth,
  wishlistController.getMyWishlist
);

router.delete(
  "/:productId",
  auth,
  validateRequest(WishlistValidation.addWishlistSchema),
  wishlistController.removeFromWishlist
);

router.patch(
  "/:productId/move-to-cart",
  auth,
  validateRequest(WishlistValidation.addWishlistSchema),
  wishlistController.moveToCart
);

export const wishlistRoutes = router;
