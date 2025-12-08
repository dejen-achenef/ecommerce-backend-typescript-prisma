import express from "express";
import cors from "cors";
import AllRoutes from "./routes/routes.js";

const app = express();

// CORS middleware - allow requests from any origin
app.use(cors());

// Middleware to parse JSON bodies
app.use(express.json());

// Middleware to parse URL-encoded bodies
app.use(express.urlencoded({ extended: true }));

// Request logging middleware (for debugging)
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check endpoint (before routes)
app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is healthy",
    timestamp: new Date().toISOString(),
  });
});

// Register all routes
app.use("/", AllRoutes);

// Root route (after other routes to avoid conflicts)
app.get("/", (req, res) => {
  res.send("Server running on ES Module + TypeScript!");
});

// 404 handler for undefined routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.path} not found`,
    availableRoutes: ["GET /", "GET /health", "POST /auth/register", "POST /auth/login"],
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log(`API endpoints available at http://localhost:${PORT}`);
});
