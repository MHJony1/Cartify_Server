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
          category: true,
          variants: true,
          images: {
            where: { isPrimary: true },
            take: 1,
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
  
  return result.map(item => {
    const product = item.product;
    const totalStock = product.variants.reduce((sum, v) => sum + v.stock, 0);
    return {
      ...item,
      product: {
        id: product.id,
        name: product.name,
        slug: product.slug,
        price: product.price,
        image: product.images[0]?.url || null,
        category: product.category,
        stock: totalStock,
        variants: product.variants,
      }
    };
  });
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

  const variant = await prisma.productVariant.findFirst({
    where: { productId, stock: { gt: 0 }, isDeleted: false },
  });

  if (!variant) {
    throw new AppError(400, "Product is out of stock");
  }

  await prisma.$transaction(async (tx: any) => {
    // Upsert CartItem
    const cartItem = await tx.cartItem.findUnique({
      where: {
        userId_productId_variantId: { userId, productId, variantId: variant.id },
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
          variantId: variant.id,
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
