import { z } from "zod";

const addWishlistSchema = z.object({
  params: z.object({
    productId: z.string().min(1, "Product ID is required"),
  }),
});

export const WishlistValidation = {
  addWishlistSchema,
};
