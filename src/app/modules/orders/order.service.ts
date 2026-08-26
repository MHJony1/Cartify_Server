import { prisma } from "../../lib/prisma";
import { ICreateOrder, IOrderQuery } from "./order.interface";
import { OrderStatus, PaymentStatus, UserRole } from "@/generated/prisma/enums";
import { AppError } from "../../errors/AppError";

// ==============================
// Create Order
// ==============================
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

    if (uniqueProductIds.size !== productIds.length) {
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

    // 6. Calculate total and prepare order items
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

    // 8. Reduce product stock
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

// ==============================
// Get My Orders
// ==============================
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

// ==============================
// Get Single Order
// ==============================
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

// ==============================
// Get All Orders - Admin
// ==============================
const getAllOrders = async (
  query: IOrderQuery
) => {
  const {
    page = 1,
    limit = 10,
    status,
    paymentStatus,
    paymentMethod,
    sortBy = "createdAt",
    sortOrder = "desc",
  } = query;

  let pageNumber = Number(page);
  let limitNumber = Number(limit);

  if (pageNumber < 1 || isNaN(pageNumber)) pageNumber = 1;
  if (limitNumber < 1 || isNaN(limitNumber)) limitNumber = 10;
  if (limitNumber > 100) limitNumber = 100;

  const allowedSortFields = ["createdAt", "updatedAt", "totalAmount"];
  const validSortBy = allowedSortFields.includes(sortBy) ? sortBy : "createdAt";
  const validSortOrder = sortOrder === "asc" ? "asc" : "desc";

  const skip =
    (pageNumber - 1) * limitNumber;

  // Build dynamic where condition
  const where: any = {
    isDeleted: false,
  };

  // Filter by order status
  if (status) {
    where.status = status;
  }

  // Filter by payment status
  if (paymentStatus) {
    where.paymentStatus = paymentStatus;
  }

  // Filter by payment method
  if (paymentMethod) {
    where.paymentMethod = paymentMethod;
  }

  // Get orders
  const orders = await prisma.order.findMany({
    where,

    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },

      items: {
        where: {
          isDeleted: false,
        },

        include: {
          product: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
        },
      },
    },

    skip,

    take: limitNumber,

    orderBy: {
      [validSortBy]: validSortOrder,
    },
  });

  // Total order count
  const total = await prisma.order.count({
    where,
  });

  const totalPages =
    Math.ceil(total / limitNumber);

  return {
    data: orders,

    meta: {
      page: pageNumber,
      limit: limitNumber,
      total,
      totalPages,
    },
  };
};

// ==============================
// Update Order Status
// ==============================
const updateOrderStatus = async (orderId: string, status: OrderStatus) => {
  const order = await prisma.order.findUnique({
    where: { id: orderId, isDeleted: false },
  });

  if (!order) {
    throw new AppError(404, "Order not found");
  }

  // Define valid transitions
  const validTransitions: Record<OrderStatus, OrderStatus[]> = {
    [OrderStatus.PENDING]: [OrderStatus.CONFIRMED, OrderStatus.CANCELLED],
    [OrderStatus.CONFIRMED]: [OrderStatus.PROCESSING, OrderStatus.CANCELLED],
    [OrderStatus.PROCESSING]: [OrderStatus.SHIPPED, OrderStatus.CANCELLED],
    [OrderStatus.SHIPPED]: [OrderStatus.DELIVERED, OrderStatus.CANCELLED],
    [OrderStatus.DELIVERED]: [],
    [OrderStatus.CANCELLED]: [],
  };

  if (order.status === status) {
    return order; // No change
  }

  if (!validTransitions[order.status as OrderStatus].includes(status)) {
    throw new AppError(
      400,
      `Cannot transition order from ${order.status} to ${status}`
    );
  }

  const updatedOrder = await prisma.order.update({
    where: { id: orderId },
    data: { status },
  });

  return updatedOrder;
};

// ==============================
// Cancel Order
// ==============================
const cancelOrder = async (orderId: string, userId: string, role: string) => {
  return await prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({
      where: { id: orderId, isDeleted: false },
      include: { items: true },
    });

    if (!order) {
      throw new AppError(404, "Order not found");
    }

    if (role !== UserRole.ADMIN && order.userId !== userId) {
      throw new AppError(403, "You do not have permission to cancel this order");
    }

    if (order.status === OrderStatus.DELIVERED) {
      throw new AppError(400, "Cannot cancel a delivered order");
    }

    if (order.status === OrderStatus.CANCELLED) {
      throw new AppError(400, "Order is already cancelled");
    }

    // Restore stock
    for (const item of order.items) {
      await tx.product.update({
        where: { id: item.productId },
        data: {
          stock: {
            increment: item.quantity,
          },
        },
      });
    }

    // Mark as cancelled
    const updatedOrder = await tx.order.update({
      where: { id: orderId },
      data: { status: OrderStatus.CANCELLED },
    });

    return updatedOrder;
  });
};

// ==============================
// Update Payment Status
// ==============================
const updatePaymentStatus = async (orderId: string, paymentStatus: PaymentStatus) => {
  const order = await prisma.order.findUnique({
    where: { id: orderId, isDeleted: false },
  });

  if (!order) {
    throw new AppError(404, "Order not found");
  }

  const updatedOrder = await prisma.order.update({
    where: { id: orderId },
    data: { paymentStatus },
  });

  return updatedOrder;
};

// ==============================
// Export
// ==============================
export const orderService = {
  createOrder,
  getMyOrders,
  getSingleOrder,
  getAllOrders,
  updateOrderStatus,
  cancelOrder,
  updatePaymentStatus,
};