import { Request, Response, NextFunction } from "express";
import { reviewService } from "./review.service";


const createReview = async (
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

    const result = await reviewService.createReview(userId, req.body);

    res.status(201).json({
      success: true,
      message: "Review created successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const getProductReviews = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { productId } = req.params;

    const result = await reviewService.getProductReviews(
      productId as string,
      req.query
    );

    res.status(200).json({
      success: true,
      message: "Product reviews retrieved successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const getMyReviews = async (
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

    const result = await reviewService.getMyReviews(userId);

    res.status(200).json({
      success: true,
      message: "My reviews retrieved successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const updateReview = async (
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

    const result = await reviewService.updateReview(
      userId,
      id as string,
      req.body
    );

    res.status(200).json({
      success: true,
      message: "Review updated successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const deleteReview = async (
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
    const { id } = req.params;

    const result = await reviewService.deleteReview(
      userId,
      role,
      id as string
    );

    res.status(200).json({
      success: true,
      message: "Review deleted successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const getAllReviews = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await reviewService.getAllReviews(req.query);

    res.status(200).json({
      success: true,
      message: "Reviews retrieved successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const reviewController = {
  createReview,
  getProductReviews,
  getMyReviews,
  updateReview,
  deleteReview,
  getAllReviews,
};
