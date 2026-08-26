import { Request, Response, NextFunction } from "express";
import { CouponService } from "./coupon.service";

export const createCoupon = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await CouponService.createCoupon(req.body);
    res.status(201).json({
      success: true,
      message: "Coupon created successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getAllCoupons = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await CouponService.getAllCoupons();
    res.status(200).json({
      success: true,
      message: "Coupons retrieved successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getCouponById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params as { id: string };
    const result = await CouponService.getCouponById(id);
    res.status(200).json({
      success: true,
      message: "Coupon retrieved successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const updateCoupon = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params as { id: string };
    const result = await CouponService.updateCoupon(id, req.body);
    res.status(200).json({
      success: true,
      message: "Coupon updated successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteCoupon = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params as { id: string };
    const result = await CouponService.deleteCoupon(id);
    res.status(200).json({
      success: true,
      message: "Coupon deleted successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const toggleStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params as { id: string };
    const result = await CouponService.toggleStatus(id);
    res.status(200).json({
      success: true,
      message: "Coupon status toggled successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const applyCoupon = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { code } = req.body;
    const result = await CouponService.applyCoupon(req.user!.userId, code);
    res.status(200).json({
      success: true,
      message: "Coupon applied successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};
