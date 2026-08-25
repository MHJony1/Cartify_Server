import {
  Request,
  Response,
  NextFunction,
} from "express";

import * as productService
  from "./product.service";


  export const createProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result =
      await productService.createProduct(
        req.body
      );

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};


export const getProducts = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result =
      await productService.getProducts();

    res.status(200).json({
      success: true,
      message: "Products retrieved successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};


export const getProductById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result =
      await productService.getProductById(
        String(req.params.id)
      );

    res.status(200).json({
      success: true,
      message: "Product retrieved successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};


export const updateProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result =
      await productService.updateProduct(
        String(req.params.id),
        req.body
      );

    res.status(200).json({
      success: true,
      message: "Product updated successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};


export const deleteProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result =
      await productService.deleteProduct(
        String(req.params.id)
      );

    res.status(200).json({
      success: true,
      message: "Product deleted successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};