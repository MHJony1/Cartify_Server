import { Request, Response, NextFunction } from "express";
import { WishlistService } from "./wishlist.service";

export const addToWishlist = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { productId } = req.params as { productId: string };
    const result = await WishlistService.addToWishlist(req.user!.userId, productId);
    res.status(201).json({
      success: true,
      message: "Product added to wishlist successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getMyWishlist = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await WishlistService.getMyWishlist(req.user!.userId);
    res.status(200).json({
      success: true,
      message: "Wishlist retrieved successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const removeFromWishlist = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { productId } = req.params as { productId: string };
    const result = await WishlistService.removeFromWishlist(req.user!.userId, productId);
    res.status(200).json({
      success: true,
      message: "Product removed from wishlist successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const moveToCart = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { productId } = req.params as { productId: string };
    const result = await WishlistService.moveToCart(req.user!.userId, productId);
    res.status(200).json({
      success: true,
      message: result.message,
      data: null,
    });
  } catch (error) {
    next(error);
  }
};
