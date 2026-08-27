import { Request, Response, NextFunction } from "express";
import { AdminService } from "./admin.service";

const getDashboardOverview = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await AdminService.getDashboardOverview();
    res.status(200).json({
      success: true,
      message: "Dashboard overview retrieved successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const getSalesAnalytics = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await AdminService.getSalesAnalytics(req.query);
    res.status(200).json({
      success: true,
      message: "Sales analytics retrieved successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const getOrderAnalytics = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await AdminService.getOrderAnalytics(req.query);
    res.status(200).json({
      success: true,
      message: "Order analytics retrieved successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const getCustomerAnalytics = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await AdminService.getCustomerAnalytics(req.query);
    res.status(200).json({
      success: true,
      message: "Customer analytics retrieved successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const getProductAnalytics = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await AdminService.getProductAnalytics(req.query);
    res.status(200).json({
      success: true,
      message: "Product analytics retrieved successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const getInventoryAnalytics = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await AdminService.getInventoryAnalytics();
    res.status(200).json({
      success: true,
      message: "Inventory analytics retrieved successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const getPaymentAnalytics = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await AdminService.getPaymentAnalytics(req.query);
    res.status(200).json({
      success: true,
      message: "Payment analytics retrieved successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const getReviewAnalytics = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await AdminService.getReviewAnalytics(req.query);
    res.status(200).json({
      success: true,
      message: "Review analytics retrieved successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const getCouponAnalytics = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await AdminService.getCouponAnalytics(req.query);
    res.status(200).json({
      success: true,
      message: "Coupon analytics retrieved successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};


export const AdminController = {
  getDashboardOverview,
  getSalesAnalytics,
  getOrderAnalytics,
  getCustomerAnalytics,
  getProductAnalytics,
  getInventoryAnalytics,
  getPaymentAnalytics,
  getReviewAnalytics,
  getCouponAnalytics,
};
