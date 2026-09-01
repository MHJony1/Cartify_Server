import { Request, Response, NextFunction } from "express";
import { orderService } from "./order.service";

const createOrder = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
      return;
    }

    const userId = req.user.id;

    const result = await orderService.createOrder(
      userId,
      req.body
    );

    res.status(201).json({
      success: true,
      message: "Order created successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const getMyOrders = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
      return;
    }

    const userId = req.user.id;

    const result =
      await orderService.getMyOrders(userId);

    res.status(200).json({
      success: true,
      message: "My orders retrieved successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const getSingleOrder = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
      return;
    }

    const userId = req.user.id;
    const { id } = req.params;

    const result = await orderService.getSingleOrder(
      userId,
      id as string
    );

    res.status(200).json({
      success: true,
      message: "Order retrieved successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const adminGetSingleOrder = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const result = await orderService.adminGetSingleOrder(id as string);

    res.status(200).json({
      success: true,
      message: "Order retrieved successfully (Admin)",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const getAllOrders = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await orderService.getAllOrders(
      req.query
    );

    res.status(200).json({
      success: true,
      message: "Orders retrieved successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const updateOrderStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const result = await orderService.updateOrderStatus(
      id as string,
      status
    );

    res.status(200).json({
      success: true,
      message: "Order status updated successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const cancelOrder = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
      return;
    }

    const { id: userId, role } = req.user;
    const id = req.params.id as string;

    const result = await orderService.cancelOrder(
      id,
      userId,
      role
    );

    res.status(200).json({
      success: true,
      message: "Order cancelled successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const updatePaymentStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = req.params.id as string;
    const { paymentStatus } = req.body;

    const result = await orderService.updatePaymentStatus(
      id,
      paymentStatus
    );

    res.status(200).json({
      success: true,
      message: "Payment status updated successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const orderController = {
  createOrder,
  getMyOrders,
  getSingleOrder,
  adminGetSingleOrder,
  getAllOrders,
  updateOrderStatus,
  cancelOrder,
  updatePaymentStatus,
};
