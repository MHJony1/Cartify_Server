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
  return prisma.$transaction(async (tx) => {
    // 1. Check user
    const user = await tx.user.findUnique({ where: { id: userId } });
    if (!user || user.isDeleted || user.status !== "ACTIVE") {
      throw new Error("User not found or inactive");
    }

    // 2. Resolve items
    let orderItemsInput: { productId: string; quantity: number }[] = [];
    let fromCart = false;

    if (payload.items && payload.items.length > 0) {
      orderItemsInput = payload.items;
    } else {
      const cartItems = await tx.cartItem.findMany({
        where: { userId, isDeleted: false },
      });
      if (cartItems.length === 0) {
        throw new Error("Order must contain at least one product (cart is empty)");
      }
      orderItemsInput = cartItems.map(c => ({ productId: c.productId, quantity: c.quantity }));
      fromCart = true;
    }

    // Check duplicate products
    const productIds = orderItemsInput.map(item => item.productId);
    if (new Set(productIds).size !== productIds.length) {
      throw new Error("Duplicate products are not allowed in the same order");
    }

    // 3. Resolve Address
    let finalShippingAddress = payload.shippingAddress;
    if (payload.addressId) {
      const address = await tx.address.findUnique({
        where: { id: payload.addressId, userId, isDeleted: false },
      });
      if (!address) throw new Error("Address not found");
      finalShippingAddress = `${address.name}, ${address.phone}, ${address.addressLine}, ${address.area}, ${address.district}, ${address.division} - ${address.postalCode}`;
    }

    if (!finalShippingAddress) {
      throw new Error("Shipping address is required");
    }

    // 4. Get products & Check stock
    const products = await tx.product.findMany({
      where: { id: { in: productIds }, isDeleted: false },
    });
    if (products.length !== orderItemsInput.length) {
      throw new Error("One or more products not found");
    }

    let subtotal = 0;
    const orderItemsData = orderItemsInput.map((item) => {
      const product = products.find((p) => p.id === item.productId)!;
      if (product.stock < item.quantity) {
        throw new Error(`Insufficient stock for ${product.name}`);
      }
      subtotal += product.price * item.quantity;
      return { productId: product.id, quantity: item.quantity, price: product.price };
    });

    // 5. Apply Coupon
    let discountAmount = 0;
    let appliedCouponId = null;

    if (payload.couponCode) {
      const coupon = await tx.coupon.findUnique({
        where: { code: payload.couponCode, isDeleted: false, isActive: true },
      });

      if (!coupon) throw new Error("Coupon not found or inactive");
      const now = new Date();
      if (now < coupon.startDate || now > coupon.endDate) throw new Error("Coupon is expired or not active");
      if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) throw new Error("Coupon usage limit reached");
      
      const userUsage = await tx.couponUsage.count({
        where: { couponId: coupon.id, userId },
      });
      if (userUsage >= coupon.perUserLimit) throw new Error("You have reached the usage limit for this coupon");
      if (coupon.minOrderAmount && subtotal < coupon.minOrderAmount) throw new Error(`Minimum order amount of ${coupon.minOrderAmount} required`);

      if (coupon.discountType === "PERCENTAGE") {
        discountAmount = (subtotal * coupon.discountValue) / 100;
        if (coupon.maxDiscountAmount && discountAmount > coupon.maxDiscountAmount) discountAmount = coupon.maxDiscountAmount;
      } else {
        discountAmount = coupon.discountValue;
      }
      
      if (discountAmount > subtotal) discountAmount = subtotal;
      appliedCouponId = coupon.id;
    }

    const totalAmount = subtotal - discountAmount;
    const paymentMethod = payload.paymentMethod || "COD";

    // 6. Create order
    const order = await tx.order.create({
      data: {
        userId,
        subtotal,
        discountAmount,
        totalAmount,
        shippingAddress: finalShippingAddress,
        paymentMethod,
        couponId: appliedCouponId,
        items: { create: orderItemsData },
      },
      include: { items: { include: { product: true } } },
    });

    // 7. Create Payment record
    await tx.payment.create({
      data: {
        orderId: order.id,
        userId,
        amount: totalAmount,
        method: paymentMethod as any,
        status: "PENDING",
      }
    });

    // 8. Record coupon usage
    if (appliedCouponId) {
      await tx.couponUsage.create({
        data: { couponId: appliedCouponId, userId, orderId: order.id },
      });
      await tx.coupon.update({
        where: { id: appliedCouponId },
        data: { usedCount: { increment: 1 } },
      });
    }

    // 9. Reduce product stock
    for (const item of orderItemsInput) {
      await tx.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.quantity } },
      });
    }

    // 10. Clear cart if used
    if (fromCart) {
      await tx.cartItem.deleteMany({
        where: { userId, productId: { in: productIds } },
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