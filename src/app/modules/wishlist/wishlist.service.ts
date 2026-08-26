import { prisma } from "@/app/lib/prisma";
import { AppError } from "@/app/errors/AppError";

const addToWishlist = async (userId: string, productId: string) => {
  const product = await prisma.product.findUnique({
    where: { id: productId, isDeleted: false },
  });

  if (!product) {
    throw new AppError(404, "Product not found");
  }

  // Handle duplicate gracefully (upsert or find first)
  const existing = await prisma.wishlistItem.findUnique({
    where: {
      userId_productId: { userId, productId },
    },
  });

  if (existing) {
    if (existing.isDeleted) {
      return await prisma.wishlistItem.update({
        where: { id: existing.id },
        data: { isDeleted: false },
      });
    }
    return existing;
  }

  const result = await prisma.wishlistItem.create({
    data: {
      userId,
      productId,
    },
  });

  return result;
};

const getMyWishlist = async (userId: string) => {
  const result = await prisma.wishlistItem.findMany({
    where: { userId, isDeleted: false },
    include: {
      product: {
        select: {
          id: true,
          name: true,
          slug: true,
          price: true,
          image: true,
          stock: true,
          category: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
  return result;
};

const removeFromWishlist = async (userId: string, productId: string) => {
  const existing = await prisma.wishlistItem.findUnique({
    where: {
      userId_productId: { userId, productId },
    },
  });

  if (!existing || existing.isDeleted) {
    throw new AppError(404, "Wishlist item not found");
  }

  const result = await prisma.wishlistItem.update({
    where: { id: existing.id },
    data: { isDeleted: true },
  });

  return result;
};

const moveToCart = async (userId: string, productId: string) => {
  const existing = await prisma.wishlistItem.findUnique({
    where: {
      userId_productId: { userId, productId },
    },
  });

  if (!existing || existing.isDeleted) {
    throw new AppError(404, "Wishlist item not found");
  }

  const product = await prisma.product.findUnique({
    where: { id: productId, isDeleted: false },
  });

  if (!product) {
    throw new AppError(404, "Product not found");
  }

  if (product.stock < 1) {
    throw new AppError(400, "Product is out of stock");
  }

  await prisma.$transaction(async (tx: any) => {
    // Upsert CartItem
    const cartItem = await tx.cartItem.findUnique({
      where: {
        userId_productId: { userId, productId },
      },
    });

    if (cartItem) {
      await tx.cartItem.update({
        where: { id: cartItem.id },
        data: {
          quantity: cartItem.quantity + 1,
          isDeleted: false,
        },
      });
    } else {
      await tx.cartItem.create({
        data: {
          userId,
          productId,
          quantity: 1,
        },
      });
    }

    // Soft delete from wishlist
    await tx.wishlistItem.update({
      where: { id: existing.id },
      data: { isDeleted: true },
    });
  });

  return { message: "Item moved to cart successfully" };
};

export const WishlistService = {
  addToWishlist,
  getMyWishlist,
  removeFromWishlist,
  moveToCart,
};
