import { prisma } from "@/app/lib/prisma";
import { IPaymentCreate } from "./payment.interface";
import { AppError } from "@/app/errors/AppError";

const createPayment = async (userId: string, payload: IPaymentCreate) => {
  const order = await prisma.order.findUnique({
    where: { id: payload.orderId, isDeleted: false },
  });

  if (!order) {
    throw new AppError(404, "Order not found");
  }

  if (order.userId !== userId) {
    throw new AppError(403, "You do not have permission to access this order");
  }

  if (order.paymentStatus === "PAID" || order.paymentStatus === "COMPLETED") {
    throw new AppError(400, "Order is already paid");
  }

  // Create payment record
  const result = await prisma.payment.create({
    data: {
      orderId: payload.orderId,
      userId,
      amount: order.totalAmount, // In Prisma schema, order has totalAmount
      method: payload.method,
      status: "PENDING",
    },
  });

  // If method is COD, we might leave it PENDING until delivery.
  // If ONLINE, in the future we would initiate a gateway session here.

  return result;
};

const getMyPayments = async (userId: string) => {
  const result = await prisma.payment.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
  return result;
};

const getPaymentById = async (userId: string, id: string) => {
  const result = await prisma.payment.findUnique({
    where: { id },
  });
  if (!result) {
    throw new AppError(404, "Payment not found");
  }

  if (result.userId !== userId) {
    throw new AppError(403, "You do not have permission to access this payment");
  }

  return result;
};

// Admin
const getAllPayments = async () => {
  const result = await prisma.payment.findMany({
    orderBy: { createdAt: "desc" },
  });
  return result;
};

const updatePaymentStatus = async (id: string, status: any) => {
  const payment = await prisma.payment.findUnique({
    where: { id },
    include: { order: true },
  });

  if (!payment) {
    throw new AppError(404, "Payment not found");
  }

  // Invalid state change prevention
  if (payment.status === "PAID" && status === "PENDING") {
    throw new AppError(400, "Cannot change PAID payment to PENDING");
  }

  const result = await prisma.$transaction(async (tx: any) => {
    const updatedPayment = await tx.payment.update({
      where: { id },
      data: { 
        status,
        ...(status === "PAID" || status === "COMPLETED" ? { paidAt: new Date() } : {})
      },
    });

    // Sync order payment status
    // Enums for order payment status are PENDING, PAID, COMPLETED, FAILED, REFUNDED
    let orderPaymentStatus = payment.order.paymentStatus;
    if (status === "PAID") orderPaymentStatus = "PAID";
    else if (status === "FAILED") orderPaymentStatus = "FAILED";
    else if (status === "COMPLETED") orderPaymentStatus = "COMPLETED";
    else if (status === "REFUNDED") orderPaymentStatus = "REFUNDED";

    await tx.order.update({
      where: { id: payment.orderId },
      data: { paymentStatus: orderPaymentStatus as any },
    });

    return updatedPayment;
  });

  return result;
};

export const PaymentService = {
  createPayment,
  getMyPayments,
  getPaymentById,
  getAllPayments,
  updatePaymentStatus,
};
