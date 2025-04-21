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
 *     summary: Get 30-day stock history
 *     description: Retrieves historical stock prices (max 30 entries)
 *     parameters:
 *       - in: path
 *         name: symbol
 *         required: true
 *         schema:
 *           type: string
 *         example: "AAPL"
 *     responses:
 *       200:
 *         description: History retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 symbol:
 *                   type: string
 *                 history:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       date:
 *                         type: string
 *                       price:
 *                         type: number
 *                 source:
 *                   type: string
 *       500:
 *         description: Failed to fetch stock history
 */
router.get("/:symbol/history", getStockHistory);

/**
 * @swagger
 * /stocks/{symbol}/news:
 *   get:
 *     tags:
 *       - Stock
 *     summary: Get recent news articles for stock
 *     parameters:
 *       - in: path
 *         name: symbol
 *         required: true
 *         schema:
 *           type: string
 *         example: "AAPL"
 *     responses:
 *       200:
 *         description: News retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 symbol:
 *                   type: string
 *                 news:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       title:
 *                         type: string
 *                       source:
 *                         type: string
 *                       url:
 *                         type: string
 *                       date:
 *                         type: string
 *                 source:
 *                   type: string
 *       500:
 *         description: Failed to fetch stock news
 */
router.get("/:symbol/news", getStockNews);

/**
 * @swagger
 * /stocks/market-trends:
 *   get:
 *     tags:
 *       - Stock
 *     summary: View market trends
 *     description: Returns market trends by sector
 *     responses:
 *       200:
 *         description: Trends fetched
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
 *                       details:
 *                         type: object
 *                 source:
 *                   type: string
 *       500:
 *         description: Failed to fetch market trends
 */
router.get("/market-trends", getMarketTrends);

/**
 * @swagger
 * /stocks/search:
 *   get:
 *     tags:
 *       - Stock
 *     summary: Search stocks
 *     description: Search for stocks by symbol or company name
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *         example: "Tesla"
 *     responses:
 *       200:
 *         description: Stocks found
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
 *                       name:
 *                         type: string
 *                 source:
 *                   type: string
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
 *     summary: Get sentiment analysis
 *     description: Analyzes recent sentiment data for a stock symbol
 *     parameters:
 *       - in: path
 *         name: symbol
 *         required: true
 *         schema:
 *           type: string
 *         example: "AAPL"
 *     responses:
 *       200:
 *         description: Sentiment data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 sentimentScore:
 *                   type: number
 *                 sentiment:
 *                   type: string
 *                 summary:
 *                   type: string
 *                 source:
 *                   type: string
 *       404:
 *         description: Sentiment not found
 *       500:
 *         description: Failed to analyze sentiment
 */
router.get("/:symbol/sentiment", getStockSentiment);

/**
 * @swagger
 * /stocks/{symbol}/alerts:
 *   post:
 *     tags:
 *       - Stock
 *     summary: Set price alert
 *     description: Set a price alert for a specific stock symbol
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: symbol
 *         required: true
 *         schema:
 *           type: string
 *         example: "AAPL"
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
 *                 example: 150
 *     responses:
 *       201:
 *         description: Alert created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 alertId:
 *                   type: string
 *       400:
 *         description: Missing price
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Failed to set alert
 */
router.post("/:symbol/alerts", verifyRole(["Investor"]), setStockAlert);

/**
 * @swagger
 * /stocks/{symbol}:
 *   get:
 *     tags:
 *       - Stock
 *     summary: Get real-time stock data
 *     description: Fetch real-time stock price, currency, and timestamp for a given symbol
 *     parameters:
 *       - in: path
 *         name: symbol
 *         required: true
 *         schema:
 *           type: string
 *         example: "AAPL"
 *     responses:
 *       200:
 *         description: Stock data retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 symbol:
 *                   type: string
 *                 price:
 *                   type: number
 *                 currency:
 *                   type: string
 *                 timestamp:
 *                   type: string
 *                 source:
 *                   type: string
 *       404:
 *         description: Stock not found
 *       500:
 *         description: Failed to fetch stock data
 */
router.get("/:symbol", getStockData);


export default router;