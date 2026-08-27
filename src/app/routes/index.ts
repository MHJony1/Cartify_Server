import { Router } from "express";
import categoryRouter from "@/app/modules/categories/category.route";
import userRouter from "@/app/modules/users/user.route";
import productRouter from "@/app/modules/products/product.route";
import { orderRoutes } from "../modules/orders/order.route";
import { cartRoutes } from "../modules/carts/cart.route";
import { reviewRoutes } from "../modules/reviews/review.route";

import { addressRoutes } from "../modules/addresses/address.route";
import { wishlistRoutes } from "../modules/wishlist/wishlist.route";
import { couponRoutes } from "../modules/coupons/coupon.route";
import { paymentRoutes } from "../modules/payments/payment.route";
import { inventoryRoutes } from "../modules/inventory/inventory.route";
import { adminRoutes } from "../modules/admin/admin.route";

const router = Router();

router.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Cartify API is running",
  });
});

const moduleRoutes = [
  {
    path: "/auth",
    route: userRouter,
  },
  {
    path: "/categories",
    route: categoryRouter,
  },
  {
    path: "/products",
    route: productRouter,
  },
  {
    path: "/carts",
    route: cartRoutes,
  },
  {
    path: "/orders",
    route: orderRoutes,
  },
  {
    path: "/reviews",
    route: reviewRoutes,
  },
  {
    path: "/addresses",
    route: addressRoutes,
  },
  {
    path: "/wishlists",
    route: wishlistRoutes,
  },
  {
    path: "/coupons",
    route: couponRoutes,
  },
  {
    path: "/payments",
    route: paymentRoutes,
  },
  {
    path: "/inventory",
    route: inventoryRoutes,
  },
  {
    path: "/admin",
    route: adminRoutes,
  },
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;