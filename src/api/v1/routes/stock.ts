import { Router } from "express";
import { getStockData, getStockHistory, getStockNews, getMarketTrends, searchStocks, getStockSentiment, setStockAlert  } from "../controllers/stockController";
import { verifyRole} from "../../../middleware/auth";

const router: Router = Router();

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

/**
 * @swagger
 * /stocks/market-trends:
 *   get:
 *     tags:
 *       - Stock
 *     description: View mock stock market trends by sector
 *     responses:
 *       200:
 *         description: Successfully retrieved market trends
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 trends:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       sector:
 *                         type: string
 *                         example: "Technology"
 *                       trend:
 *                         type: string
 *                         example: "Up"
 *                       changePercent:
 *                         type: string
 *                         example: "+1.5%"
 *       500:
 *         description: Failed to fetch market trends
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Failed to fetch market trends"
 */
router.get("/market-trends", getMarketTrends);

/**
 * @swagger
 * /stocks/search:
 *   get:
 *     tags:
 *       - Stock
 *     description: Search stocks by symbol or name (case-insensitive)
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *         description: Search term for symbol or company name
 *     responses:
 *       200:
 *         description: Matched stock results
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 results:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       symbol:
 *                         type: string
 *                         example: "AAPL"
 *                       name:
 *                         type: string
 *                         example: "Apple Inc."
 *       500:
 *         description: Failed to search stocks
 */
router.get("/search", searchStocks);


/**
 * @swagger
 * /stocks/{symbol}/sentiment:
 *   get:
 *     tags:
 *       - Stock
 *     description: Analyze mock sentiment based on recent news
 *     parameters:
 *       - in: path
 *         name: symbol
 *         required: true
 *         description: Stock symbol to analyze sentiment for
 *         schema:
 *           type: string
 *           example: "AAPL"
 *     responses:
 *       200:
 *         description: Sentiment analysis result
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 symbol:
 *                   type: string
 *                   example: "AAPL"
 *                 sentimentScore:
 *                   type: number
 *                   example: 0.78
 *                 sentiment:
 *                   type: string
 *                   example: "Positive"
 *                 summary:
 *                   type: string
 *                   example: "Most recent news articles reflect positive sentiment toward the stock."
 *       500:
 *         description: Failed to analyze sentiment
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Failed to analyze sentiment"
 */
router.get("/:symbol/sentiment", getStockSentiment);

/**
 * @swagger
 * /stocks/{symbol}/alerts:
 *   post:
 *     tags:
 *       - Stock
 *     description: Set a mock price alert for a stock (Investor only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: symbol
 *         required: true
 *         description: The stock symbol to set alert for
 *         schema:
 *           type: string
 *           example: "AAPL"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - targetPrice
 *             properties:
 *               targetPrice:
 *                 type: number
 *                 example: 150.25
 *     responses:
 *       201:
 *         description: Alert created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Alert set for AAPL at price $150.25"
 *                 alertId:
 *                   type: string
 *                   example: "alert_AAPL_1713227328703"
 *       400:
 *         description: Missing target price
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Failed to set stock alert
 */
router.post("/:symbol/alerts", verifyRole(["Investor"]), setStockAlert);

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

export default router;