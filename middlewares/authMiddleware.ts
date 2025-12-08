import { Request, Response, NextFunction } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({} as any);

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      userId?: string;
      user?: {
        id: string;
        username: string;
        email: string;
      };
    }
  }
}

export const authenticateUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // For now, this is a placeholder - will be enhanced with JWT later
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      res.status(401).json({
        success: false,
        message: "Authentication required. Please provide authorization token.",
      });
      return;
    }

    // Placeholder for JWT verification
    // TODO: Implement JWT token verification
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: "Invalid authentication token",
    });
  }
};

export const optionalAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  // Optional authentication - doesn't fail if no token provided
  try {
    const authHeader = req.headers.authorization;
    if (authHeader) {
      // TODO: Verify JWT and attach user to request
    }
    next();
  } catch (error) {
    // Continue even if auth fails for optional auth
    next();
  }
};

