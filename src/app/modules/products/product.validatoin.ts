import { z } from "zod";

const productDataSchema = z.object({
  name: z
    .string()
    .min(2, "Product name must be at least 2 characters"),

  description: z
    .string()
    .min(10, "Description must be at least 10 characters"),

  price: z
    .number()
    .positive("Price must be greater than 0"),

  stock: z
    .number()
    .int("Stock must be an integer")
    .nonnegative("Stock cannot be negative"),

  image: z
    .string()
    .url("Invalid image URL")
    .optional(),

  categoryId: z
    .string()
    .min(1, "Category ID is required"),
});

export const createProductSchema = z.object({
  body: z.union([
    productDataSchema,
    z.array(productDataSchema).min(1).max(50),
  ]),
});

export const updateProductSchema = z.object({
  body: z.object({
    name: z.string().min(2).optional(),

    description: z.string().min(10).optional(),

    price: z.number().positive().optional(),

    stock: z.number().int().nonnegative().optional(),

    image: z.string().url().optional(),

    categoryId: z.string().min(1).optional(),
  }),
});