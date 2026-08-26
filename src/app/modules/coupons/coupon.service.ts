import { prisma } from "@/app/lib/prisma";
import { ICoupon } from "./coupon.interface";
import { AppError } from "@/app/errors/AppError";

const createCoupon = async (payload: ICoupon) => {
  const existing = await prisma.coupon.findUnique({ where: { code: payload.code } });
  if (existing) {
    throw new AppError(400, "Coupon code already exists");
  }

  const result = await prisma.coupon.create({
    data: {
      ...payload,
      startDate: new Date(payload.startDate),
      endDate: new Date(payload.endDate),
    },
  });
  return result;
};

const getAllCoupons = async () => {
  const result = await prisma.coupon.findMany({
    where: { isDeleted: false },
    orderBy: { createdAt: "desc" },
  });
  return result;
};

const getCouponById = async (id: string) => {
  const result = await prisma.coupon.findUnique({
    where: { id, isDeleted: false },
  });
  if (!result) {
    throw new AppError(404, "Coupon not found");
  }
  return result;
};

const updateCoupon = async (id: string, payload: Partial<ICoupon>) => {
  const coupon = await prisma.coupon.findUnique({
    where: { id, isDeleted: false },
  });
  if (!coupon) {
    throw new AppError(404, "Coupon not found");
  }

  const updateData: any = { ...payload };
  if (payload.startDate) updateData.startDate = new Date(payload.startDate);
  if (payload.endDate) updateData.endDate = new Date(payload.endDate);

  const result = await prisma.coupon.update({
    where: { id },
    data: updateData,
  });
  return result;
};

const deleteCoupon = async (id: string) => {
  const coupon = await prisma.coupon.findUnique({
    where: { id, isDeleted: false },
  });
  if (!coupon) {
    throw new AppError(404, "Coupon not found");
  }

  const result = await prisma.coupon.update({
    where: { id },
    data: { isDeleted: true, isActive: false },
  });
  return result;
};

const toggleStatus = async (id: string) => {
  const coupon = await prisma.coupon.findUnique({
    where: { id, isDeleted: false },
  });
  if (!coupon) {
    throw new AppError(404, "Coupon not found");
  }

  const result = await prisma.coupon.update({
    where: { id },
    data: { isActive: !coupon.isActive },
  });
  return result;
};

const applyCoupon = async (userId: string, code: string) => {
  // Find valid coupon
  const coupon = await prisma.coupon.findUnique({
    where: { code, isDeleted: false, isActive: true },
  });

  if (!coupon) {
    throw new AppError(404, "Coupon not found or inactive");
  }

  const now = new Date();
  if (now < coupon.startDate || now > coupon.endDate) {
    throw new AppError(400, "Coupon is expired or not yet active");
  }

  if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
    throw new AppError(400, "Coupon usage limit reached");
  }

  const userUsage = await prisma.couponUsage.count({
    where: { couponId: coupon.id, userId },
  });

  if (userUsage >= coupon.perUserLimit) {
    throw new AppError(400, "You have reached the usage limit for this coupon");
  }

  // Calculate cart total
  const cartItems = await prisma.cartItem.findMany({
    where: { userId, isDeleted: false },
    include: { product: true },
  });

  if (!cartItems.length) {
    throw new AppError(400, "Cart is empty");
  }

  let subtotal = 0;
  cartItems.forEach((item: any) => {
    subtotal += item.product.price * item.quantity;
  });

  if (coupon.minOrderAmount && subtotal < coupon.minOrderAmount) {
    throw new AppError(400, `Minimum order amount of ${coupon.minOrderAmount} required`);
  }

  let discount = 0;
  if (coupon.discountType === "PERCENTAGE") {
    discount = (subtotal * coupon.discountValue) / 100;
    if (coupon.maxDiscountAmount && discount > coupon.maxDiscountAmount) {
      discount = coupon.maxDiscountAmount;
    }
  } else {
    discount = coupon.discountValue;
  }

  if (discount > subtotal) {
    discount = subtotal;
  }

  return {
    subtotal,
    discount,
    total: subtotal - discount,
    coupon: {
      id: coupon.id,
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
    }
  };
};

export const CouponService = {
  createCoupon,
  getAllCoupons,
  getCouponById,
  updateCoupon,
  deleteCoupon,
  toggleStatus,
  applyCoupon,
};
