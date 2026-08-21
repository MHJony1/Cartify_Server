import { Request, Response, NextFunction } from 'express';

import * as userService from './user.service';

export const registerUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await userService.registerUser(req.body);

    res.status(201).json({
      success: true,
      message: 'User registered Successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const loginUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await userService.loginUser(req.body);
    res.status(200).json({
      success: true,
      message: 'Login Successful',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getAllUser = async (req: Request, res: Response) => {
  try {
    const result = await userService.getAllUser();
    res.json({
      status: 200,
      message: 'All User retrived successfully',
      data: result,
    });
  } catch (error: any) {
    res.status(500).json({
      status: 500,
      message: error.message,
    });
  }
};

export const getSingleUser = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const result = await (userService as any).getSingleUser(id);

    res.json({
      status: 200,
      message: 'User retrived successfully',
      data: result,
    });
  } catch (error: any) {
    res.status(500).json({
      status: 500,
      message: error.message,
    });
  }
};

export const updateSingleUser = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const userPayload = req.body;
    const result = await (userService as any).updateSingleUser(id, userPayload);

    res.json({
      status: 200,
      message: 'User updated successfully',
      data: result,
    });
  } catch (error: any) {
    res.status(500).json({
      status: 500,
      message: error.message,
    });
  }
};

export const deleteSingleUser = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const result = await (userService as any).deleteSingleUser(id);

    res.json({
      status: 200,
      message: 'User deleted successfully',
      data: result,
    });
  } catch (error: any) {
    res.status(500).json({
      status: 500,
      message: error.message,
    });
  }
};
export const logout = async (req: Request, res: Response) => {
  try {
    res.clearCookie('accessToken');
    res.json({
      status: 200,
      message: 'User logged out successfully',
    });
  } catch (error: any) {
    res.status(500).json({
      status: 500,
      message: error.message,
    });
  }
};
