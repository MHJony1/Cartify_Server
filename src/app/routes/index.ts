import { Router } from "express";
import categoryRouter from "@/app/modules/categories/category.route";
import userRouter from "@/app/modules/users/user.route";

const router = Router();

router.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Cartify API is running",
  });
});


router.use("/categories", categoryRouter);
router.use("/auth", userRouter);

export default router;