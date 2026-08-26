import { Request, Response, NextFunction } from "express";
import { AddressService } from "./address.service";

export const createAddress = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await AddressService.createAddress(req.user!.userId, req.body);
    res.status(201).json({
      success: true,
      message: "Address created successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getMyAddresses = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await AddressService.getMyAddresses(req.user!.userId);
    res.status(200).json({
      success: true,
      message: "Addresses retrieved successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getAddressById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params as { id: string };
    const result = await AddressService.getAddressById(req.user!.userId, id);
    res.status(200).json({
      success: true,
      message: "Address retrieved successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const updateAddress = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params as { id: string };
    const result = await AddressService.updateAddress(req.user!.userId, id, req.body);
    res.status(200).json({
      success: true,
      message: "Address updated successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteAddress = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params as { id: string };
    const result = await AddressService.deleteAddress(req.user!.userId, id);
    res.status(200).json({
      success: true,
      message: "Address deleted successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const setDefaultAddress = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params as { id: string };
    const result = await AddressService.setDefaultAddress(req.user!.userId, id);
    res.status(200).json({
      success: true,
      message: "Default address set successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};
