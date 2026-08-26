import { prisma } from "../../lib/prisma";
import { ICreateOrder } from "./order.interface";

const createOrder = async (
  userId: string,
  payload: ICreateOrder
) => {
  const {
    items,
    shippingAddress,
    paymentMethod = "COD",
  } = payload;

  return prisma.$transaction(async (tx) => {
    // 1. Check user
    const user = await tx.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user) {
      throw new Error("User not found");
    }

    if (user.isDeleted) {
      throw new Error("User account is deleted");
    }

    if (user.status !== "ACTIVE") {
      throw new Error("User account is not active");
    }

    // 2. Check duplicate products
    const productIds = items.map(
      (item) => item.productId
    );

    const uniqueProductIds = new Set(productIds);

    if (
      uniqueProductIds.size !== productIds.length
    ) {
      throw new Error(
        "Duplicate products are not allowed in the same order"
      );
    }

    // 3. Get products
    const products = await tx.product.findMany({
      where: {
        id: {
          in: productIds,
        },
        isDeleted: false,
      },
    });

    // 4. Check all products exist
    if (products.length !== items.length) {
      throw new Error(
        "One or more products not found"
      );
    }

    // 5. Check stock
    for (const item of items) {
      const product = products.find(
        (p) => p.id === item.productId
      );

      if (!product) {
        throw new Error(
          `Product ${item.productId} not found`
        );
      }

      if (product.stock < item.quantity) {
        throw new Error(
          `Insufficient stock for ${product.name}`
        );
      }
    }

    // 6. Calculate total
    let totalAmount = 0;

    const orderItems = items.map((item) => {
      const product = products.find(
        (p) => p.id === item.productId
      )!;

      const itemTotal =
        product.price * item.quantity;

      totalAmount += itemTotal;

      return {
        productId: product.id,
        quantity: item.quantity,
        price: product.price,
      };
    });

    // 7. Create order
    const order = await tx.order.create({
      data: {
        userId,
        totalAmount,
        shippingAddress,
        paymentMethod,
        items: {
          create: orderItems,
        },
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    // 8. Reduce stock
    for (const item of items) {
      await tx.product.update({
        where: {
          id: item.productId,
        },
        data: {
          stock: {
            decrement: item.quantity,
          },
        },
      });
    }

    return order;
  });
};

const getMyOrders = async (userId: string) => {
  const orders = await prisma.order.findMany({
    where: {
      userId,
      isDeleted: false,
    },
    include: {
      items: {
        where: {
          isDeleted: false,
        },
        include: {
          product: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return orders;
};

const getSingleOrder = async (
  userId: string,
  orderId: string
) => {
  const order = await prisma.order.findFirst({
    where: {
      id: orderId,
      userId,
      isDeleted: false,
    },
    include: {
      items: {
        where: {
          isDeleted: false,
        },
        include: {
          product: true,
        },
      },
    },
  });

  if (!order) {
    throw new Error("Order not found");
  }

  return order;
};

export const orderService = {
  createOrder,
  getMyOrders,
  getSingleOrder
};