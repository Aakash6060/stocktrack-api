import * as dotenv from 'dotenv';
import express from "express";
import morgan from "morgan";
import cors from "cors";
import { Request, Response } from "express";

import authRoutes from "./api/v1/routes/auth";
import stockRoutes from "./api/v1/routes/stock";
import portfolioRoutes from "./api/v1/routes/portfolio";
import { specs, swaggerUi } from './swagger';

const app = express();

/**
 * Loads environment variables from .env file into process.env.
 */
dotenv.config();

/**
 * Middleware to parse incoming JSON requests.
 */
app.use(express.json());

/**
 * Enables Cross-Origin Resource Sharing (CORS).
 */
app.use(cors());

/**
 * HTTP request logger middleware for development environment.
 */
app.use(morgan("dev"));

/**
 * Serves Swagger UI documentation at /api-docs.
 */
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

/**
 * Route handler for authentication-related endpoints.
 * Base path: /api/v1/auth
 */
app.use("/api/v1/auth", authRoutes);

/**
 * Route handler for stock-related endpoints.
 * Base path: /api/v1/stocks
 */
app.use("/api/v1/stocks", stockRoutes);

/**
 * Route handler for portfolio-related endpoints.
 * Base path: /api/v1/portfolio
 */
app.use("/api/v1/portfolio", portfolioRoutes);

/**
 * Root route to verify API is running.
 */
app.get("/", (req: Request, res: Response) => {
    res.send("Welcome to StockTrack API");
  });

export default app;