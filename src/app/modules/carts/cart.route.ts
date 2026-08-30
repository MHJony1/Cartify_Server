import { Router } from "express";
import { cartController } from "./cart.controller";
import { auth } from "@/app/middleware/auth";
import { validateRequest } from "@/app/middleware/validateRequest";
import { cartValidation } from "./cart.validation";

const router = Router();

router.post(
  "/",
  auth,
  validateRequest(cartValidation.addToCartSchema),
  cartController.addToCart
);

router.get(
  "/",
  auth,
  cartController.getMyCart
);

router.patch(
  "/:cartItemId",
  auth,
  validateRequest(cartValidation.updateCartItemSchema),
  cartController.updateCartItemQuantity
);

router.delete(
  "/:cartItemId",
  auth,
  cartController.removeCartItem
);

router.delete(
  "/",
  auth,
  cartController.clearCart
);

export const cartRoutes = router;
