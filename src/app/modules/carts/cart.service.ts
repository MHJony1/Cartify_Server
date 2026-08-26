import { prisma } from "../../lib/prisma";
import { AppError } from "../../errors/AppError";
import { IAddToCart } from "./cart.interface";

// ==============================
// Add to Cart
// ==============================
const addToCart = async (userId: string, payload: IAddToCart) => {
  const { productId, quantity } = payload;

  const product = await prisma.product.findUnique({
    where: { id: productId, isDeleted: false },
  });

  if (!product) {
    throw new AppError(404, "Product not found");
  }

  let cartItem = await prisma.cartItem.findUnique({
    where: {
      userId_productId: { userId, productId },
    },
  });

  if (cartItem) {
    if (cartItem.isDeleted) {
      if (quantity > product.stock) {
        throw new AppError(400, "Insufficient stock");
      }
      return await prisma.cartItem.update({
        where: { id: cartItem.id },
        data: { quantity, isDeleted: false },
      });
    } else {
      const newQuantity = cartItem.quantity + quantity;
      if (newQuantity > product.stock) {
        throw new AppError(400, "Insufficient stock to add this quantity");
      }
      return await prisma.cartItem.update({
        where: { id: cartItem.id },
        data: { quantity: newQuantity },
      });
    }
  } else {
    if (quantity > product.stock) {
      throw new AppError(400, "Insufficient stock");
    }
    return await prisma.cartItem.create({
      data: {
        userId,
        productId,
        quantity,
      },
    });
  }
};

// ==============================
// Get My Cart
// ==============================
const getMyCart = async (userId: string) => {
  const cartItems = await prisma.cartItem.findMany({
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
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  let totalAmount = 0;

  const formattedItems = cartItems.map((item) => {
    const itemTotal = item.product.price * item.quantity;
    totalAmount += itemTotal;

    return {
      ...item,
      itemTotal,
    };
  });

  return {
    items: formattedItems,
    totalAmount,
  };
};

// ==============================
// Update Cart Item Quantity
// ==============================
const updateCartItemQuantity = async (
  userId: string,
  productId: string,
  quantity: number
) => {
  const product = await prisma.product.findUnique({
    where: { id: productId, isDeleted: false },
  });

  if (!product) {
    throw new AppError(404, "Product not found");
  }

  if (quantity > product.stock) {
    throw new AppError(400, "Quantity cannot exceed current product stock");
  }

  const cartItem = await prisma.cartItem.findUnique({
    where: { userId_productId: { userId, productId } },
  });

  if (!cartItem || cartItem.isDeleted) {
    throw new AppError(404, "Cart item not found");
  }

  return await prisma.cartItem.update({
    where: { id: cartItem.id },
    data: { quantity },
  });
};

// ==============================
// Remove Cart Item
// ==============================
const removeCartItem = async (userId: string, productId: string) => {
  const cartItem = await prisma.cartItem.findUnique({
    where: { userId_productId: { userId, productId } },
  });

  if (!cartItem || cartItem.isDeleted) {
    throw new AppError(404, "Cart item not found");
  }

  return await prisma.cartItem.update({
    where: { id: cartItem.id },
    data: { isDeleted: true },
  });
};

// ==============================
// Clear Cart
// ==============================
const clearCart = async (userId: string) => {
  const result = await prisma.cartItem.updateMany({
    where: { userId, isDeleted: false },
    data: { isDeleted: true },
  });

  return result;
};

export const cartService = {
  addToCart,
  getMyCart,
  updateCartItemQuantity,
  removeCartItem,
  clearCart,
};
