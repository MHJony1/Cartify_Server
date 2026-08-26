import { z } from "zod";

const createCouponSchema = z.object({
  body: z.object({
    code: z.string().min(1, "Code is required"),
    description: z.string().optional(),
    discountType: z.enum(["PERCENTAGE", "FIXED"]),
    discountValue: z.number().positive("Discount value must be positive"),
    minOrderAmount: z.number().nonnegative().optional(),
    maxDiscountAmount: z.number().positive().optional(),
    startDate: z.string().min(1, "Start date is required").datetime(),
    endDate: z.string().min(1, "End date is required").datetime(),
    usageLimit: z.number().int().positive().optional(),
    perUserLimit: z.number().int().positive().optional(),
    isActive: z.boolean().optional(),
  }),
});

const updateCouponSchema = z.object({
  body: z.object({
    code: z.string().optional(),
    description: z.string().optional(),
    discountType: z.enum(["PERCENTAGE", "FIXED"]).optional(),
    discountValue: z.number().positive().optional(),
    minOrderAmount: z.number().nonnegative().optional(),
    maxDiscountAmount: z.number().positive().optional(),
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
    usageLimit: z.number().int().positive().optional(),
    perUserLimit: z.number().int().positive().optional(),
    isActive: z.boolean().optional(),
  }),
});

const applyCouponSchema = z.object({
  body: z.object({
    code: z.string().min(1, "Coupon code is required"),
  }),
});

export const CouponValidation = {
  createCouponSchema,
  updateCouponSchema,
  applyCouponSchema,
};
