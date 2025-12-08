import express from "express";
import { createUser } from "../controllers/controllers.js";
import { loginUser } from "../controllers/authControllers.js";
import { createProduct, getProducts, getProductById, updateProduct, deleteProduct } from "../controllers/productControllers.js";
import { createOrder, getOrders } from "../controllers/orderControllers.js";
import { authenticateUser, requireAdmin } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Auth routes
router.post("/auth/register", createUser);
router.post("/auth/login", loginUser);

// Product routes
// Public routes
router.get("/products", getProducts);
router.get("/products/:id", getProductById);

// Protected Admin routes
router.post("/products", authenticateUser, requireAdmin, createProduct);
router.put("/products/:id", authenticateUser, requireAdmin, updateProduct);
router.delete("/products/:id", authenticateUser, requireAdmin, deleteProduct);

// Order routes (protected - authenticated users only)
router.post("/orders", authenticateUser, createOrder);
router.get("/orders", authenticateUser, getOrders);

export default router;
