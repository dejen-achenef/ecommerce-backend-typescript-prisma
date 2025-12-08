import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({} as any);


export const createOrder = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { description, products } = req.body;
    const userId = req.userId || req.body.userId;

    if (!description || !products || !Array.isArray(products) || products.length === 0) {
      res.status(400).json({
        success: false,
        message: "Description and products array are required",
      });
      return;
    }

    // Calculate total price and validate products
    let totalPrice = 0;
    const orderProducts = [];

    for (const item of products) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
      });

      if (!product) {
        res.status(404).json({
          success: false,
          message: `Product with ID ${item.productId} not found`,
        });
        return;
      }

      if (product.stock < item.quantity) {
        res.status(400).json({
          success: false,
          message: `Insufficient stock for product ${product.name}. Available: ${product.stock}, Requested: ${item.quantity}`,
        });
        return;
      }

      const itemTotal = product.price * item.quantity;
      totalPrice += itemTotal;

      orderProducts.push({
        productId: item.productId,
        quantity: item.quantity,
        totalPrice: itemTotal,
      });
    }

    // Create order with order products
    const order = await prisma.order.create({
      data: {
        userId,
        description: description.trim(),
        totalPrice,
        status: "pending",
        orderProducts: {
          create: orderProducts,
        },
      },
      include: {
        orderProducts: {
          include: {
            product: true,
          },
        },
      },
    });

    // Update product stock
    for (const item of products) {
      await prisma.product.update({
        where: { id: item.productId },
        data: {
          stock: {
            decrement: item.quantity,
          },
        },
      });
    }

    res.status(201).json({
      success: true,
      message: "Order created successfully",
      data: order,
    });
  } catch (error: any) {
    console.error("Order creation error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create order",
    });
  }
};

export const getOrders = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = req.userId || req.query.userId as string;
    const { status, page = 1, limit = 10 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where: any = {};
    if (userId) where.userId = userId;
    if (status) where.status = status;

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { id: "desc" },
        include: {
          orderProducts: {
            include: {
              product: true,
            },
          },
        },
      }),
      prisma.order.count({ where }),
    ]);

    res.status(200).json({
      success: true,
      data: orders,
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
      message: "Failed to fetch orders",
    });
  }
};

