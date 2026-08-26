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

    const userId = req.user.userId;

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

    const userId = req.user.userId;

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

    const userId = req.user.userId;
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

export const orderController = {
  createOrder,
  getMyOrders,
  getSingleOrder
};