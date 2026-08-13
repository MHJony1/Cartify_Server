import { z } from "zod";

export const createCategorySchema = z.object({
  body: z.object({
    name: z
      .string()
      .min(2, "Category name must be at least 2 characters"),

    slug: z
      .string()
      .min(2, "Category slug must be at least 2 characters")
      .regex(
        /^[a-z0-9-]+$/,
        "Slug can only contain lowercase letters, numbers and hyphens"
      ),
  }),
});

export const updateCategorySchema = z.object({
  body: z.object({
    name: z
      .string()
      .min(2, "Category name must be at least 2 characters")
      .optional(),

    slug: z
      .string()
      .min(2, "Category slug must be at least 2 characters")
      .regex(
        /^[a-z0-9-]+$/,
        "Slug can only contain lowercase letters, numbers and hyphens"
      )
      .optional(),
  }),
});