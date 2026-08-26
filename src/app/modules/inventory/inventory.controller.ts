import { Request, Response, NextFunction } from "express";
import { InventoryService } from "./inventory.service";

const getInventory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await InventoryService.getInventory(req.query);
    res.status(200).json({
      success: true,
      message: "Inventory retrieved successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const getInventoryDetails = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { productId } = req.params as { productId: string };
    const result = await InventoryService.getInventoryDetails(productId);
    res.status(200).json({
      success: true,
      message: "Inventory details retrieved successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const getInventoryHistory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { productId } = req.params as { productId: string };
    const result = await InventoryService.getInventoryHistory(productId, req.query);
    res.status(200).json({
      success: true,
      message: "Inventory history retrieved successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const restock = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { productId } = req.params as { productId: string };
    const result = await InventoryService.restock(productId, req.body);
    res.status(200).json({
      success: true,
      message: "Stock restocked successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const damage = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { productId } = req.params as { productId: string };
    const result = await InventoryService.damage(productId, req.body);
    res.status(200).json({
      success: true,
      message: "Stock damage recorded successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const adjust = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { productId } = req.params as { productId: string };
    const result = await InventoryService.adjust(productId, req.body);
    res.status(200).json({
      success: true,
      message: "Stock adjusted successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const InventoryController = {
  getInventory,
  getInventoryDetails,
  getInventoryHistory,
  restock,
  damage,
  adjust,
};
