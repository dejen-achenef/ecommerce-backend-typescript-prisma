import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
// Prisma 7.0.0 requires options parameter, but will use prisma.config.ts for database URL
const prisma = new PrismaClient({} as any);

import bcrypt from "bcrypt";

export const createUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { username, email, password } = req.body;

  if (username == null || email == null || password == null) {
    res.status(400).json({
      success: false,
      message: "full the fields first",
    });
  }
  const hashedPassword = await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
    data: { username, email, password: hashedPassword },
  });
  console.log(user);
};
