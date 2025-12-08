import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { validatePrice, validateStock } from "../validators/inputValidators.js";
import { AppError, handlePrismaError } from "../functions/errorHandler.js";

const prisma = new PrismaClient({} as any);

export const createProduct = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { name, description, price, stock, category } = req.body;
    const userId = req.userId || req.body.userId; // From auth middleware or body

    if (!name || !description || price === undefined || stock === undefined) {
      res.status(400).json({
        success: false,
        message: "Name, description, price, and stock are required",
      });
      return;
    }

    const priceValidation = validatePrice(price);
    if (!priceValidation.valid) {
      res.status(400).json({
        success: false,
        message: priceValidation.message,
      });
      return;
    }

    const stockValidation = validateStock(stock);
    if (!stockValidation.valid) {
      res.status(400).json({
        success: false,
        message: stockValidation.message,
      });
      return;
    }

    const product = await prisma.product.create({
      data: {
        name: name.trim(),
        description: description.trim(),
        price: parseFloat(price),
        stock: parseInt(stock),
        category: category?.trim() || null,
        userId: userId,
      },
    });

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      data: product,
    });
  } catch (error: any) {
    const appError = handlePrismaError(error);
    res.status(appError.statusCode).json({
      success: false,
      message: appError.message,
    });
  }
};

export const getProducts = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { category, page = 1, limit = 10 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where = category ? { category: category as string } : {};

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { id: "desc" },
      }),
      prisma.product.count({ where }),
    ]);

    res.status(200).json({
      success: true,
      data: products,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch products",
    });
  }
};

export const getProductById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    const product = await prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      res.status(404).json({
        success: false,
        message: "Product not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch product",
    });
  }
};

