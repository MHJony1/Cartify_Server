import { Request, Response, NextFunction } from "express";
import { PaymentService } from "./payment.service";

export const createPayment = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await PaymentService.createPayment(req.user!.userId, req.body);
    res.status(201).json({
      success: true,
      message: "Payment created successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getMyPayments = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await PaymentService.getMyPayments(req.user!.userId);
    res.status(200).json({
      success: true,
      message: "Payments retrieved successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getPaymentById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params as { id: string };
    const result = await PaymentService.getPaymentById(req.user!.userId, id);
    res.status(200).json({
      success: true,
      message: "Payment retrieved successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getAllPayments = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await PaymentService.getAllPayments();
    res.status(200).json({
      success: true,
      message: "All payments retrieved successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const updatePaymentStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params as { id: string };
    const { status } = req.body;
    const result = await PaymentService.updatePaymentStatus(id, status);
    res.status(200).json({
      success: true,
      message: "Payment status updated successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};
