import type { Request, Response, NextFunction } from "express";
import * as categoryService from "./category.service";

// create a new category
export const createCategory = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await categoryService.createCategory(req.body);

    res.status(201).json({
      success: true,
      message: "Category created successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// get all categories
export const getCategories = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await categoryService.getAllCategories();

    res.status(200).json({
      success: true,
      message: "Categories retrieved successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// get a category by id
export const getCategoryById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params as { id: string };
    const result = await categoryService.getCategoryById(id);

    res.status(200).json({
      success: true,
      message: "Category retrieved successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// update a category
export const updateCategory = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params as { id: string };
    const result = await categoryService.updateCategory(id, req.body);

    res.status(200).json({
      success: true,
      message: "Category updated successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// delete a category
export const deleteCategory = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params as { id: string };
    const result = await categoryService.deleteCategory(id);

    res.status(200).json({
      success: true,
      message: "Category deleted successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};