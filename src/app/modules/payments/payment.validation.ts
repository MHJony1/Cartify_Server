import { z } from "zod";

const createPaymentSchema = z.object({
  body: z.object({
    orderId: z.string().min(1, "Order ID is required"),
    method: z.enum(["COD", "ONLINE"]),
  }),
});

const updatePaymentStatusSchema = z.object({
  body: z.object({
    status: z.enum(["PENDING", "PAID", "COMPLETED", "FAILED", "REFUNDED", "CANCELLED"]),
  }),
});

export const PaymentValidation = {
  createPaymentSchema,
  updatePaymentStatusSchema,
};
