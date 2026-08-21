import {
  Request,
  Response,
  NextFunction,
} from "express";
import { AppError } from "../errors/AppError";
import { UserRole } from "@/generated/prisma/enums";

export const authorize = (...allowedRoles: UserRole[]) => {
  return (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    if (!req.user) {
      return next(
        new AppError(
          401,
          "Authentication required"
        )
      );
    }

    if (
      !allowedRoles.includes(req.user.role)
    ) {
      return next(
        new AppError(
          403,
          "You do not have permission to access this resource"
        )
      );
    }

    next();
  };
};