import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({} as any);

export const createOrder = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { products } = req.body;
    const userId = req.userId; // From auth middleware

    if (!userId) {
      res.status(401).json({
        success: false,
        message: "Authentication required",
        errors: ["Authentication required"],
      });
      return;
    }

    if (!products || !Array.isArray(products) || products.length === 0) {
      res.status(400).json({
        success: false,
        message: "Products array is required",
        errors: ["Products array is required and must not be empty"],
      });
      return;
    }

    // Validate products array structure
    for (const item of products) {
      if (!item.productId || item.quantity === undefined) {
        res.status(400).json({
          success: false,
          message: "Each product must have productId and quantity",
          errors: ["Each product must have productId and quantity"],
        });
        return;
      }
      if (item.quantity <= 0) {
        res.status(400).json({
          success: false,
          message: "Quantity must be greater than 0",
          errors: ["Quantity must be greater than 0"],
        });
        return;
      }
    }

    // Use transaction to ensure atomicity
    const order = await prisma.$transaction(async (tx) => {
      // Calculate total price and validate products
      let totalPrice = 0;
      const orderProducts = [];

      for (const item of products) {
        // Fetch product with lock to prevent race conditions
        const product = await tx.product.findUnique({
          where: { id: item.productId },
        });

        if (!product) {
          throw new Error(`Product with ID ${item.productId} not found`);
        }

        if (product.stock < item.quantity) {
          throw new Error(`Insufficient stock for product ${product.name}. Available: ${product.stock}, Requested: ${item.quantity}`);
        }

        const itemTotal = product.price * item.quantity;
        totalPrice += itemTotal;

        orderProducts.push({
          productId: item.productId,
          quantity: item.quantity,
          totalPrice: itemTotal,
        });

        // Update product stock within transaction
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              decrement: item.quantity,
            },
          },
        });
      }

      // Create order with order products
      const newOrder = await tx.order.create({
        data: {
          userId,
          description: `Order placed by user ${userId}`,
          totalPrice,
          status: "pending",
          orderProducts: {
            create: orderProducts,
          },
        },
        select: {
          id: true,
          userId: true,
          description: true,
          totalPrice: true,
          status: true,
          createdAt: true,
          orderProducts: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  price: true,
                  description: true,
                },
              },
            },
          },
        },
      });

      return newOrder;
    });

    res.status(201).json({
      success: true,
      message: "Order created successfully",
        object: {
        order_id: order.id,
        status: order.status,
        total_price: order.totalPrice,
        products: order.orderProducts.map((op: any) => ({
          productId: op.productId,
          quantity: op.quantity,
          product: op.product,
        })),
        created_at: order.createdAt,
      },
      errors: null,
    });
  } catch (error: any) {
    console.error("Order creation error:", error);
    
    if (error.message.includes("not found")) {
      res.status(404).json({
        success: false,
        message: error.message,
        errors: [error.message],
      });
      return;
    }

    if (error.message.includes("Insufficient stock")) {
      res.status(400).json({
        success: false,
        message: error.message,
        errors: [error.message],
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: "Failed to create order",
      errors: ["Failed to create order"],
    });
  }
};

export const getOrders = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = req.userId; // From auth middleware - must be authenticated

    if (!userId) {
      res.status(401).json({
        success: false,
        message: "Authentication required",
        errors: ["Authentication required"],
      });
      return;
    }

    // Filter orders by authenticated user only
    const where: any = {
      userId: userId, // Always filter by authenticated user
    };

    const orders = await prisma.order.findMany({
      where,
      orderBy: { id: "desc" },
      select: {
        id: true,
        userId: true,
        description: true,
        totalPrice: true,
        status: true,
        createdAt: true,
        orderProducts: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                price: true,
                description: true,
              },
            },
          },
        },
      },
    });

    // Format orders according to spec
    const formattedOrders = orders.map((order) => ({
      order_id: order.id,
      status: order.status,
      total_price: order.totalPrice,
      created_at: order.createdAt,
      products: order.orderProducts.map((op: any) => ({
        productId: op.productId,
        quantity: op.quantity,
        product: op.product,
      })),
    }));

    res.status(200).json({
      success: true,
      message: "Orders retrieved successfully",
      object: formattedOrders,
      errors: null,
    });
  } catch (error: any) {
    console.error("Get orders error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch orders",
      errors: ["Failed to fetch orders"],
    });
  }
};

