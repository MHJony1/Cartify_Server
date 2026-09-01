import { Request, Response, NextFunction } from 'express';
import { AppError } from '@/app/errors/AppError';

import * as userService from './user.service';

export const registerUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await userService.registerUser(req.body);

    // Set HTTP-only cookie for auto-login
    res.cookie('accessToken', result.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

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
    
    // Set HTTP-only cookie
    res.cookie('accessToken', result.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(200).json({
      success: true,
      message: 'Login Successful',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const googleLoginUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { credential } = req.body;
    if (!credential) {
      throw new AppError(400, 'Google credential is required');
    }

    const result = await userService.googleLoginUser(credential);
    
    // Set HTTP-only cookie
    res.cookie('accessToken', result.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(200).json({
      success: true,
      message: 'Google Login Successful',
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
    const result = await userService.getSingleUser(id);

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

export const updateSingleUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    const userPayload = req.body;
    
    // IDOR Protection: Only the user themselves or an ADMIN can update the profile
    const currentUser = (req as any).user;
    if (currentUser.role !== 'ADMIN' && currentUser.id !== id) {
      throw new AppError(403, 'You do not have permission to update this profile');
    }

    const result = await userService.updateSingleUser(id, userPayload);

    res.json({
      status: 200,
      message: 'User updated successfully',
      data: result,
    });
  } catch (error: any) {
    next(error);
  }
};

export const deleteSingleUser = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const result = await userService.deleteSingleUser(id);

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
    res.clearCookie('accessToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
    });
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

export const getMe = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const user = req.user;
    
    if (!user) {
      throw new AppError(404, 'User not found');
    }

    res.status(200).json({
      success: true,
      message: 'User retrieved successfully',
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

export const adminGetAllUsers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await userService.adminGetAllUsers(req.query);
    res.status(200).json({
      success: true,
      message: 'Users retrieved successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const adminGetSingleUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const result = await userService.adminGetSingleUser(id as string);
    res.status(200).json({
      success: true,
      message: 'User retrieved successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const adminUpdateUserStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const adminId = (req as any).user.id;

    const result = await userService.adminUpdateUserStatus(adminId, id as string, status);
    res.status(200).json({
      success: true,
      message: 'User status updated successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const adminUpdateUserRole = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    const adminId = (req as any).user.id;

    const result = await userService.adminUpdateUserRole(adminId, id as string, role);
    res.status(200).json({
      success: true,
      message: 'User role updated successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};
