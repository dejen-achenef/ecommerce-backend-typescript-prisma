import { Request, Response, NextFunction } from "express";

// Simple in-memory rate limiting (for production, use Redis)
interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

const store: RateLimitStore = {};

const cleanupInterval = 60000; // Clean up expired entries every minute
setInterval(() => {
  const now = Date.now();
  Object.keys(store).forEach((key) => {
    if (store[key].resetTime < now) {
      delete store[key];
    }
  });
}, cleanupInterval);

export const rateLimiter = (
  windowMs: number = 15 * 60 * 1000, // 15 minutes
  maxRequests: number = 100
) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const key = req.ip || "unknown";
    const now = Date.now();

    if (!store[key] || store[key].resetTime < now) {
      store[key] = {
        count: 1,
        resetTime: now + windowMs,
      };
      next();
      return;
    }

    if (store[key].count >= maxRequests) {
      res.status(429).json({
        success: false,
        message: "Too many requests, please try again later",
        retryAfter: Math.ceil((store[key].resetTime - now) / 1000),
      });
      return;
    }

    store[key].count++;
    next();
  };
};

export const strictRateLimiter = rateLimiter(15 * 60 * 1000, 10); // 10 requests per 15 minutes
export const normalRateLimiter = rateLimiter(15 * 60 * 1000, 100); // 100 requests per 15 minutes

