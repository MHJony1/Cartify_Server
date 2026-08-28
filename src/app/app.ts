import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import morgan from "morgan";
import swaggerUi from "swagger-ui-express";
import { rateLimit } from "express-rate-limit";
import router from "./routes";
import { notFound } from "./middleware/notFound";
import { globalErrorHandler } from "./middleware/globalErrorHandler";

const app = express();

// Security headers
app.use(helmet());

// Performance compression
app.use(compression());

// Request logging
app.use(morgan(process.env.NODE_ENV === "development" ? "dev" : "combined"));

// CORS configuration
app.use(
  cors({
    origin: process.env.CLIENT_URL || "*",
    credentials: true,
  })
);

// Rate limiting
const limiter = rateLimit({
  windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: Number(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: "Too many requests from this IP, please try again later.",
});
app.use("/api", limiter);

// Payload size limits
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

app.use("/api/v1", router);

// Swagger Documentation Route
import fs from "fs";
import path from "path";
try {
  const swaggerDocument = JSON.parse(fs.readFileSync(path.join(__dirname, "docs", "swagger.json"), "utf8"));
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
} catch (err) {
  console.log("Swagger documentation not found or invalid at src/app/docs/swagger.json");
}

app.use(notFound);

app.use(globalErrorHandler);


export default app;

