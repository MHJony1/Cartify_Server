import { z } from "zod";

const productVariantSchema = z.object({
  size: z.string().min(1, "Size is required"),
  color: z.string().min(1, "Color is required"),
  sku: z.string().min(3, "SKU must be at least 3 characters"),
  price: z.number().positive("Variant price must be greater than 0"),
  stock: z.number().int().nonnegative("Variant stock cannot be negative"),
  compareAtPrice: z.number().positive().optional(),
});

const productImageSchema = z.object({
  url: z.string().url("Invalid image URL"),
  altText: z.string().optional(),
  sortOrder: z.number().int().optional(),
  isPrimary: z.boolean().optional(),
});

const productDataSchema = z.object({
  name: z.string().min(2, "Product name must be at least 2 characters"),
  description: z.string().optional(),
  price: z.number().positive("Price must be greater than 0"),
  gender: z.enum(["MEN", "WOMEN", "KIDS", "UNISEX"]).optional(),
  material: z.string().optional(),
  brand: z.string().optional(),
  collection: z.string().optional(),
  categoryId: z.string().min(1, "Category ID is required"),
  variants: z.array(productVariantSchema).min(1, "At least one variant is required"),
  images: z.array(productImageSchema).optional(),
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
    description: z.string().optional(),
    price: z.number().positive().optional(),
    gender: z.enum(["MEN", "WOMEN", "KIDS", "UNISEX"]).optional(),
    material: z.string().optional(),
    brand: z.string().optional(),
    collection: z.string().optional(),
    categoryId: z.string().min(1).optional(),
    variants: z.array(productVariantSchema).optional(),
    images: z.array(productImageSchema).optional(),
  }),
});