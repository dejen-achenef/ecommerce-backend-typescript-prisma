import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import { validateEmail, validatePassword, validateUsername } from "../validators/inputValidators.js";

// Prisma 7.0.0 requires options parameter, but will use prisma.config.ts for database URL
const prisma = new PrismaClient({} as any);

import { validateEmail, validatePassword, validateUsername } from "../validators/inputValidators.js";

export const createUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { username, email, password } = req.body;

    // Validate input
    if (!username || !email || !password) {
      res.status(400).json({
        success: false,
        message: "Please fill all fields: username, email, and password are required",
        errors: ["Username, email, and password are required"],
      });
      return;
    }

    // Validate email format
    if (!validateEmail(email)) {
      res.status(400).json({
        success: false,
        message: "Invalid email format",
        errors: ["Email must be a valid email address format (e.g., user@example.com)"],
      });
      return;
    }

    // Validate username
    const usernameValidation = validateUsername(username);
    if (!usernameValidation.valid) {
      res.status(400).json({
        success: false,
        message: usernameValidation.message || "Invalid username",
        errors: [usernameValidation.message || "Invalid username"],
      });
      return;
    }

    // Validate password
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      res.status(400).json({
        success: false,
        message: passwordValidation.message || "Invalid password",
        errors: [passwordValidation.message || "Invalid password"],
      });
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = await prisma.user.create({
      data: {
        username: username.trim(),
        email: email.trim().toLowerCase(),
        password: hashedPassword,
        role: "User",
      },
      // Don't return password in response
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      object: user,
      errors: null,
    });
  } catch (error: any) {
    console.error("Signup error:", error);

    // Handle Prisma errors
    if (error.code === "P2002") {
      // Unique constraint violation
      const field = error.meta?.target?.[0] || "field";
      const fieldName = field === "username" ? "Username" : "Email";
      res.status(400).json({
        success: false,
        message: `${fieldName} already exists`,
        errors: [`${fieldName} already exists`],
      });
    } else if (error.code === "P1001") {
      // Database connection error
      res.status(503).json({
        success: false,
        message: "Database connection failed. Please try again later.",
        errors: ["Database connection failed"],
      });
    } else {
      res.status(500).json({
        success: false,
        message: "Internal server error",
        errors: [process.env.NODE_ENV === "development" ? error.message : "Internal server error"],
      });
    }
  }
};
