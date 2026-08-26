import { z } from "zod";
import { OrderStatus, PaymentStatus } from "@/generated/prisma/enums";

export const createOrderValidationSchema = z.object({
  body: z.object({
    items: z
      .array(
        z.object({
          productId: z.string().min(1, "Product ID is required"),
          quantity: z
            .number()
            .int("Quantity must be an integer")
            .positive("Quantity must be greater than 0"),
        })
      )
      .optional(),

    shippingAddress: z
      .string()
      .min(5, "Shipping address is required")
      .optional(),

    addressId: z.string().optional(),
    couponCode: z.string().optional(),

    paymentMethod: z
      .enum(["COD", "ONLINE"])
      .optional(),
  }).refine((data) => data.shippingAddress || data.addressId, {
    message: "Either shippingAddress or addressId must be provided",
    path: ["addressId"],
  }),
});

export const updateOrderStatusSchema = z.object({
  body: z.object({
    status: z.nativeEnum(OrderStatus, {
      message: "Invalid order status",
    }),
  }),
});

export const updatePaymentStatusSchema = z.object({
  body: z.object({
    paymentStatus: z.nativeEnum(PaymentStatus, {
      message: "Invalid payment status",
    }),
  }),
});

export const orderValidation = {
  createOrderValidationSchema,
  updateOrderStatusSchema,
  updatePaymentStatusSchema,
};