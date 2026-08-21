import {
  Request,
  Response,
  NextFunction,
} from "express";

import { verifyToken } from "../utils/jwt";
import { AppError } from "../errors/AppError";

export const auth = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      throw new AppError(
        401,
        "Authentication required"
      );
    }

    const [scheme, token] =
      authHeader.split(" ");

    if (
      scheme !== "Bearer" ||
      !token
    ) {
      throw new AppError(
        401,
        "Invalid authorization format"
      );
    }

    const decoded = verifyToken(token);

    if (typeof decoded === "string") {
      throw new AppError(401, "Invalid token payload");
    }

    Object.assign(req, { user: decoded });

    next();
  } catch (error) {
    next(error);
  }
};





