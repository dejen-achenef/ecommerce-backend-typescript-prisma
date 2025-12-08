import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { validatePrice, validateStock, validateProductName, validateProductDescription } from "../validators/inputValidators.js";
import { AppError, handlePrismaError } from "../functions/errorHandler.js";

const prisma = new PrismaClient({} as any);

export const createProduct = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { name, description, price, stock, category } = req.body;
    const userId = req.userId; // From auth middleware

    if (!userId) {
      res.status(401).json({
        success: false,
        message: "Authentication required",
        errors: ["Authentication required"],
      });
      return;
    }

    if (!name || !description || price === undefined || stock === undefined) {
      res.status(400).json({
        success: false,
        message: "Name, description, price, and stock are required",
        errors: ["Name, description, price, and stock are required"],
      });
      return;
    }

    // Validate name
    const nameValidation = validateProductName(name);
    if (!nameValidation.valid) {
      res.status(400).json({
        success: false,
        message: nameValidation.message,
        errors: [nameValidation.message || "Invalid product name"],
      });
      return;
    }

    // Validate description
    const descriptionValidation = validateProductDescription(description);
    if (!descriptionValidation.valid) {
      res.status(400).json({
        success: false,
        message: descriptionValidation.message,
        errors: [descriptionValidation.message || "Invalid product description"],
      });
      return;
    }

    // Validate price
    const priceValidation = validatePrice(price);
    if (!priceValidation.valid) {
      res.status(400).json({
        success: false,
        message: priceValidation.message,
        errors: [priceValidation.message || "Invalid price"],
      });
      return;
    }

    // Validate stock
    const stockValidation = validateStock(stock);
    if (!stockValidation.valid) {
      res.status(400).json({
        success: false,
        message: stockValidation.message,
        errors: [stockValidation.message || "Invalid stock"],
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
      object: product,
      errors: null,
    });
  } catch (error: any) {
    const appError = handlePrismaError(error);
    res.status(appError.statusCode).json({
      success: false,
      message: appError.message,
      errors: [appError.message],
    });
  }
};

export const getProducts = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { category, search, page = 1, limit = 10, pageSize } = req.query;
    const pageNumber = Number(page);
    const pageSizeValue = Number(pageSize || limit);
    const skip = (pageNumber - 1) * pageSizeValue;

    // Build where clause
    const where: any = {};
    
    if (category) {
      where.category = category as string;
    }

    // Search functionality - case-insensitive partial match on name
    if (search && typeof search === "string" && search.trim().length > 0) {
      where.name = {
        contains: search.trim(),
        mode: "insensitive",
      };
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: pageSizeValue,
        orderBy: { id: "desc" },
        select: {
          id: true,
          name: true,
          price: true,
          stock: true,
          category: true,
          description: true,
        },
      }),
      prisma.product.count({ where }),
    ]);

    res.status(200).json({
      success: true,
      message: "Products retrieved successfully",
      object: products,
      currentPage: pageNumber,
      pageSize: pageSizeValue,
      totalPages: Math.ceil(total / pageSizeValue),
      totalProducts: total,
      errors: null,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch products",
      errors: ["Failed to fetch products"],
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
        errors: ["Product not found"],
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Product retrieved successfully",
      object: product,
      errors: null,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch product",
      errors: ["Failed to fetch product"],
    });
  }
};

export const updateProduct = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, description, price, stock, category } = req.body;

    // Check if product exists
    const existingProduct = await prisma.product.findUnique({
      where: { id },
    });

    if (!existingProduct) {
      res.status(404).json({
        success: false,
        message: "Product not found",
        errors: ["Product not found"],
      });
      return;
    }

    // Build update data object
    const updateData: any = {};

    if (name !== undefined) {
      const nameValidation = validateProductName(name);
      if (!nameValidation.valid) {
        res.status(400).json({
          success: false,
          message: nameValidation.message,
          errors: [nameValidation.message || "Invalid product name"],
        });
        return;
      }
      updateData.name = name.trim();
    }

    if (description !== undefined) {
      const descriptionValidation = validateProductDescription(description);
      if (!descriptionValidation.valid) {
        res.status(400).json({
          success: false,
          message: descriptionValidation.message,
          errors: [descriptionValidation.message || "Invalid product description"],
        });
        return;
      }
      updateData.description = description.trim();
    }

    if (price !== undefined) {
      const priceValidation = validatePrice(price);
      if (!priceValidation.valid) {
        res.status(400).json({
          success: false,
          message: priceValidation.message,
          errors: [priceValidation.message || "Invalid price"],
        });
        return;
      }
      updateData.price = parseFloat(price);
    }

    if (stock !== undefined) {
      const stockValidation = validateStock(stock);
      if (!stockValidation.valid) {
        res.status(400).json({
          success: false,
          message: stockValidation.message,
          errors: [stockValidation.message || "Invalid stock"],
        });
        return;
      }
      updateData.stock = parseInt(stock);
    }

    if (category !== undefined) {
      updateData.category = category?.trim() || null;
    }

    // Update product
    const updatedProduct = await prisma.product.update({
      where: { id },
      data: updateData,
    });

    res.status(200).json({
      success: true,
      message: "Product updated successfully",
      object: updatedProduct,
      errors: null,
    });
  } catch (error: any) {
    const appError = handlePrismaError(error);
    res.status(appError.statusCode).json({
      success: false,
      message: appError.message,
      errors: [appError.message],
    });
  }
};

export const deleteProduct = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      res.status(404).json({
        success: false,
        message: "Product not found",
        errors: ["Product not found"],
      });
      return;
    }

    // Delete product
    await prisma.product.delete({
      where: { id },
    });

    res.status(200).json({
      success: true,
      message: "Product deleted successfully",
      object: null,
      errors: null,
    });
  } catch (error: any) {
    const appError = handlePrismaError(error);
    res.status(appError.statusCode).json({
      success: false,
      message: appError.message,
      errors: [appError.message],
    });
  }
};

