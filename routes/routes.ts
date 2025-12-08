import express from "express";
import { createUser } from "../controllers/controllers.js";
import { createProduct, getProducts, getProductById } from "../controllers/productControllers.js";
import { createOrder, getOrders } from "../controllers/orderControllers.js";
import { authenticateUser } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Auth routes
router.post("/auth/register", createUser);

// Product routes
router.post("/products", authenticateUser, createProduct);
router.get("/products", getProducts);
router.get("/products/:id", getProductById);

// Order routes
router.post("/orders", authenticateUser, createOrder);
router.get("/orders", authenticateUser, getOrders);

// Test route to verify router is working
router.get("/test", (req, res) => {
  res.json({
    success: true,
    message: "Routes are working!",
    timestamp: new Date().toISOString(),
  });
});

export default router;
