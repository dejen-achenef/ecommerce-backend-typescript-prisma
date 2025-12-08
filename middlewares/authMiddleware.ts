import { Request, Response, NextFunction } from "express";
import { PrismaClient } from "@prisma/client";
import { verifyToken } from "../functions/jwt.js";

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
        role?: string;
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
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      res.status(401).json({
        success: false,
        message: "Authentication required. Please provide authorization token.",
        errors: ["Authentication required"],
      });
      return;
    }

    // Extract token from "Bearer <token>" format
    const token = authHeader.startsWith("Bearer ") 
      ? authHeader.slice(7) 
      : authHeader;

    // Verify JWT token
    const decoded = verifyToken(token);

    if (!decoded) {
      res.status(401).json({
        success: false,
        message: "Invalid authentication token",
        errors: ["Invalid or expired token"],
      });
      return;
    }

    // Attach user info to request
    req.userId = decoded.userId;
    req.user = {
      id: decoded.userId,
      username: decoded.username,
      email: decoded.email,
      role: decoded.role || "User",
    };

    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: "Invalid authentication token",
      errors: ["Invalid authentication token"],
    });
  }
};

export const requireAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // First check if user is authenticated
    if (!req.user || !req.userId) {
      res.status(401).json({
        success: false,
        message: "Authentication required",
        errors: ["Authentication required"],
      });
      return;
    }

    // Check if user has Admin role
    if (req.user.role !== "Admin") {
      res.status(403).json({
        success: false,
        message: "Access denied. Admin role required.",
        errors: ["Access denied. Admin role required."],
      });
      return;
    }

    next();
  } catch (error) {
    res.status(403).json({
      success: false,
      message: "Access denied",
      errors: ["Access denied"],
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

