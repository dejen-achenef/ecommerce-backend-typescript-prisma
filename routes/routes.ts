import express from "express";
import { createUser } from "../functions/routeFucntions.js";

const router = express.Router();

// Register routes
router.post("/auth/register", (req, res, next) => {
  console.log("Signup route hit - Request received");
  console.log("Body:", req.body);
  createUser(req, res).catch(next);
});

// Test route to verify router is working
router.get("/test", (req, res) => {
  res.json({
    success: true,
    message: "Routes are working!",
    timestamp: new Date().toISOString(),
  });
});

export default router;
