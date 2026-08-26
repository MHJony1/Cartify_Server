import { Router } from "express";
import { orderController } from "./order.controller";
import { auth } from "@/app/middleware/auth";


const router = Router();

router.post(
  "/",
  auth,
  orderController.createOrder
);
router.get(
  "/my-orders",
  auth,
  orderController.getMyOrders
);
router.get(
  "/:id",
  auth,
  orderController.getSingleOrder
);

export const orderRoutes = router;