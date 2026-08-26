import { Router } from "express";
import categoryRouter from "@/app/modules/categories/category.route";
import userRouter from "@/app/modules/users/user.route";
import productRouter from "@/app/modules/products/product.route";
import { orderRoutes } from "../modules/orders/order.route";
import { cartRoutes } from "../modules/carts/cart.route";
import { reviewRoutes } from "../modules/reviews/review.route";

const router = Router();

router.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Cartify API is running",
  });
});


router.use("/categories", categoryRouter);
router.use("/auth", userRouter);
router.use("/products",productRouter);
router.use("/orders",orderRoutes);
router.use("/cart", cartRoutes);
router.use("/reviews", reviewRoutes);
export default router;