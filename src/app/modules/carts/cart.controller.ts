import { Request, Response, NextFunction } from "express";
import { cartService } from "./cart.service";

const addToCart = async (
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

    const result = await cartService.addToCart(userId, req.body);

    res.status(200).json({
      success: true,
      message: "Product added to cart successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const getMyCart = async (
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

    const result = await cartService.getMyCart(userId);

    res.status(200).json({
      success: true,
      message: "Cart retrieved successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const updateCartItemQuantity = async (
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
    const { productId } = req.params;
    const { quantity } = req.body;

    const result = await cartService.updateCartItemQuantity(
      userId,
      productId as string,
      quantity
    );

    res.status(200).json({
      success: true,
      message: "Cart item updated successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const removeCartItem = async (
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
    const { productId } = req.params;

    const result = await cartService.removeCartItem(userId, productId as string);

    res.status(200).json({
      success: true,
      message: "Cart item removed successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const clearCart = async (
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

    const result = await cartService.clearCart(userId);

    res.status(200).json({
      success: true,
      message: "Cart cleared successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const cartController = {
  addToCart,
  getMyCart,
  updateCartItemQuantity,
  removeCartItem,
  clearCart,
};
