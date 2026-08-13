import { Router } from "express";
import categoryRouter from "@/app/modules/categories/category.route";

const router = Router();

router.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Cartify API is running",
  });
});


router.use("/categories", categoryRouter);

export default router;