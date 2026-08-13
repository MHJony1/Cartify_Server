import type { Request, Response, NextFunction } from "express";
import type { UserRole } from "@/generated/prisma/enums";

export const auth = (...roles: UserRole[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    // TODO: implement real token verification and role check
    next();
  };
};