import { z } from "zod";

const restockSchema = z.object({
  body: z.object({
    variantId: z.string().min(1, "Variant ID is required"),
    quantity: z.number().int().positive("Quantity must be a positive integer"),
    note: z.string().optional(),
  }),
});

const damageSchema = z.object({
  body: z.object({
    variantId: z.string().min(1, "Variant ID is required"),
    quantity: z.number().int().positive("Quantity must be a positive integer"),
    note: z.string().optional(),
  }),
});

const adjustSchema = z.object({
  body: z.object({
    variantId: z.string().min(1, "Variant ID is required"),
    operation: z.enum(["INCREASE", "DECREASE", "SET"]),
    quantity: z.number().int().nonnegative("Quantity must be a non-negative integer"),
    note: z.string().optional(),
  }),
});

export const InventoryValidation = {
  restockSchema,
  damageSchema,
  adjustSchema,
};
