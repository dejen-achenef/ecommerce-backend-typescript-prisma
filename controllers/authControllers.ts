import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import { validateEmail } from "../validators/inputValidators.js";
import { generateToken } from "../functions/jwt.js";

const prisma = new PrismaClient({} as any);

export const loginUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({
        success: false,
        message: "Email and password are required",
        errors: ["Email and password are required"],
      });
      return;
    }

    // Validate email format
    if (!validateEmail(email)) {
      res.status(400).json({
        success: false,
        message: "Invalid email format",
        errors: ["Email must be a valid email address format"],
      });
      return;
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: email.trim().toLowerCase() },
    });

    if (!user) {
      res.status(401).json({
        success: false,
        message: "Invalid credentials",
        errors: ["Invalid email or password"],
      });
      return;
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      res.status(401).json({
        success: false,
        message: "Invalid credentials",
        errors: ["Invalid email or password"],
      });
      return;
    }

    // Generate JWT token
    const token = generateToken({
      userId: user.id,
      username: user.username,
      email: user.email,
      role: user.role || "User",
    });

    res.status(200).json({
      success: true,
      message: "Login successful",
      object: {
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role || "User",
        },
      },
      errors: null,
    });
  } catch (error: any) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      errors: ["Internal server error"],
    });
  }
};

