import { Request, Response, NextFunction } from "express";
import { z } from "zod";

export const validateRequest = (schema: z.ZodType) => {
  return async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      await schema.parseAsync({
        body: req.body,
        params: req.params,
        query: req.query,
      });

      next();
    } catch (error) {
      next(error);
    }
  };
};