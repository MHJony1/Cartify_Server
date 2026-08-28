import type { Request, Response, NextFunction } from "express";
import { Prisma } from "@/generated/prisma/client";
import { ZodError } from "zod";
import { AppError } from "../errors/AppError";

export const globalErrorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error(err);

  let statusCode = 500;
  let message = "Something went wrong";
  let errors: any[] = [];

  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
  } else if (err instanceof ZodError) {
    statusCode = 400;
    message = "Validation error";

    errors = err.issues.map((issue) => ({
      field: issue.path.join("."),
      message: issue.message,
    }));
  } else if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2002") {
      statusCode = 409;
      message = "Duplicate value already exists";
    } else if (err.code === "P2025") {
      statusCode = 404;
      message = "Requested resource not found";
    } else if (err.code === "P2003") {
      statusCode = 400;
      message = "Invalid reference: related record does not exist";
    }
  } else if (err instanceof Prisma.PrismaClientValidationError) {
    statusCode = 400;
    message = "Invalid data provided";
  } else if (err instanceof Error) {
    console.error("Internal Server Error:", err);
    message = process.env.NODE_ENV === "development" ? err.message : "Something went wrong";
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(errors.length > 0 && { errors }),
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};