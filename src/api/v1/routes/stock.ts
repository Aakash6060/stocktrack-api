import { Router } from "express";
import { getStockData } from "../controllers/stockController";

const router = Router();

/**
 * @swagger
 * /stocks/{symbol}:
 *   get:
 *     tags:
 *       - Stock
 *     description: Get real-time stock data for a given stock symbol
 *     parameters:
 *       - in: path
 *         name: symbol
 *         required: true
 *         description: The stock symbol (e.g., AAPL, TSLA)
 *         schema:
 *           type: string
 *           example: "AAPL"
 *     responses:
 *       200:
 *         description: Successfully retrieved stock data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 symbol:
 *                   type: string
 *                   example: "AAPL"
 *                 price:
 *                   type: number
 *                   format: float
 *                   example: 145.50
 *                 currency:
 *                   type: string
 *                   example: "USD"
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                   example: "2025-04-03T10:00:00Z"
 *       500:
 *         description: Failed to fetch stock data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Failed to fetch stock data"
 */
router.get("/:symbol", getStockData);

export default router;
