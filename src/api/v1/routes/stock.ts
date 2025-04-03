import { Router } from "express";
import { getStockData, getStockHistory, getStockNews } from "../controllers/stockController";

const router = Router();

/**
 * @swagger
 * /stocks/{symbol}:
 *   get:
 *     tags:
 *       - Stock
 *     description: Get mock stock data for a given stock symbol (to be replaced with real-time data in future milestones)
 *     parameters:
 *       - in: path
 *         name: symbol
 *         required: true
 *         description: The stock symbol (e.g., AAPL, TSLA) for which stock data is requested
 *         schema:
 *           type: string
 *           example: "AAPL"
 *     responses:
 *       200:
 *         description: Successfully retrieved mock stock data (to be replaced with real stock data in Milestone 2)
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
 *         description: Failed to fetch stock data (mock or real-time integration error)
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

/**
 * @swagger
 * /stocks/{symbol}/history:
 *   get:
 *     tags:
 *       - Stock
 *     description: Get mock stock history data for a given stock symbol
 *     parameters:
 *       - in: path
 *         name: symbol
 *         required: true
 *         description: The stock symbol (e.g., AAPL, TSLA) for which stock history is requested
 *         schema:
 *           type: string
 *           example: "AAPL"
 *     responses:
 *       200:
 *         description: Successfully retrieved mock stock history
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 symbol:
 *                   type: string
 *                   example: "AAPL"
 *                 history:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       date:
 *                         type: string
 *                         example: "2025-04-01"
 *                       price:
 *                         type: number
 *                         format: float
 *                         example: 145.50
 *       500:
 *         description: Failed to fetch stock history
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Failed to fetch stock history"
 */
router.get("/:symbol/history", getStockHistory);

/**
 * @swagger
 * /stocks/{symbol}/news:
 *   get:
 *     tags:
 *       - Stock
 *     description: Fetch mock news articles for a given stock symbol
 *     parameters:
 *       - in: path
 *         name: symbol
 *         required: true
 *         description: The stock symbol (e.g., AAPL, TSLA) for which stock news is requested
 *         schema:
 *           type: string
 *           example: "AAPL"
 *     responses:
 *       200:
 *         description: Successfully retrieved mock stock news
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 symbol:
 *                   type: string
 *                   example: "AAPL"
 *                 news:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       title:
 *                         type: string
 *                         example: "Apple announces new iPhone"
 *                       source:
 *                         type: string
 *                         example: "TechCrunch"
 *                       url:
 *                         type: string
 *                         example: "https://techcrunch.com/apple-new-iphone"
 *                       date:
 *                         type: string
 *                         example: "2025-04-03"
 *       500:
 *         description: Failed to fetch stock news
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Failed to fetch stock news"
 */
router.get("/:symbol/news", getStockNews);

export default router;
