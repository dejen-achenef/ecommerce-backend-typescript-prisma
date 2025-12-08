import { Request, Response, NextFunction } from "express";
import { Prisma } from "@prisma/client";

export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

export const handlePrismaError = (error: any): AppError => {

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case "P2002":
        const field = error.meta?.target?.[0] || "field";
        return new AppError(
          `${field === "username" ? "Username" : field === "email" ? "Email" : "Field"} already exists`,
          409
        );
      case "P1001":
        return new AppError("Database connection failed", 503);
      case "P2025":
        return new AppError("Record not found", 404);
      default:
        return new AppError("Database operation failed", 500);
    }
  }
  return new AppError(error.message || "An error occurred", 500);
};

export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  let error = err;

  // Handle Prisma errors
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    error = handlePrismaError(err);
  }

  // If it's not an AppError, convert it
  if (!(error instanceof AppError)) {
    error = new AppError(error.message || "Internal server error", 500);
  }

  const statusCode = error instanceof AppError ? error.statusCode : 500;

  res.status(statusCode).json({
    success: false,
    message: error.message,
    ...(process.env.NODE_ENV === "development" && { stack: error.stack }),
  });
};

