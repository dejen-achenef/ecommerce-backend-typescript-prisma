import dotenv from "dotenv";

dotenv.config();

export const config = {
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || "development",
  databaseUrl: process.env.DATABASE_URL || "",
  jwtSecret: process.env.JWT_SECRET || "your-secret-key-change-in-production",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
  bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS || "12"),
  corsOrigin: process.env.CORS_ORIGIN || "*",
};

// Validate required environment variables
if (!config.databaseUrl && config.nodeEnv === "production") {
  throw new Error("DATABASE_URL is required in production");
}

