import {
  Request,
  Response,
  NextFunction,
} from "express";

import { verifyToken } from "../utils/jwt";
import { AppError } from "../errors/AppError";
import { prisma } from "../lib/prisma";

export const auth = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    let token = req.cookies?.accessToken;
    
    // Fallback to authorization header
    if (!token) {
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1];
      }
    }

    if (!token) {
      throw new AppError(
        401,
        "Authentication required"
      );
    }

    const decoded = verifyToken(token);

    if (typeof decoded === "string") {
      throw new AppError(401, "Invalid token payload");
    }
    
    // Additional database check for security
    const user = await prisma.user.findUnique({
      where: { id: (decoded as any).userId },
    });

    if (!user) {
      throw new AppError(401, "User not found");
    }

    if (user.isDeleted) {
      throw new AppError(401, "User account is deleted");
    }

    if (user.status !== "ACTIVE") {
      throw new AppError(401, "User account is not active");
    }

    Object.assign(req, { user: decoded });

    next();
  } catch (error) {
    next(error);
  }
};





