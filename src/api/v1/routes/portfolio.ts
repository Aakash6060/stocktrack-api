import { Router } from "express";
import { addStockToPortfolio, getUserPortfolio, removeStockFromPortfolio, getPortfolioPerformance, setPriceAlert, deletePriceAlert } from "../controllers/portfolioController";
import { verifyRole} from "../../../middleware/auth";

const router: Router = Router();

/**
 * @swagger
 * /portfolio/add-stock:
 *   post:
 *     tags:
 *       - Portfolio
 *     summary: Add stock to portfolio
 *     description: Adds a stock with quantity and average buy price to the authenticated user's portfolio.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - symbol
 *               - quantity
 *               - averageBuyPrice
 *             properties:
 *               symbol:
 *                 type: string
 *                 example: "AAPL"
 *               quantity:
 *                 type: integer
 *                 example: 10
 *               averageBuyPrice:
 *                 type: number
 *                 format: float
 *                 example: 145.5
 *     responses:
 *       201:
 *         description: Stock added successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Stock added to portfolio"
 *       500:
 *         description: Failed to add stock
 */
router.post("/add-stock", verifyRole(["Investor"]), addStockToPortfolio);

/**
 * @swagger
 * /portfolio:
 *   get:
 *     tags:
 *       - Portfolio
 *     summary: Get user portfolio
 *     description: Retrieves all stocks in the authenticated user's portfolio.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Portfolio retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 portfolio:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       symbol:
 *                         type: string
 *                       quantity:
 *                         type: integer
 *                       averageBuyPrice:
 *                         type: number
 *       500:
 *         description: Failed to fetch portfolio
 */
router.get("/", verifyRole(["Investor"]), getUserPortfolio);

/**
 * @swagger
 * /portfolio/remove/{symbol}:
 *   delete:
 *     tags:
 *       - Portfolio
 *     summary: Remove stock by symbol
 *     description: Deletes all portfolio entries for the given stock symbol.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: symbol
 *         required: true
 *         schema:
 *           type: string
 *         description: Ticker symbol of the stock
 *     responses:
 *       200:
 *         description: Stock removed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Stock removed from portfolio"
 *       404:
 *         description: Stock not found
 *       500:
 *         description: Failed to remove stock
 */
router.delete("/remove/:symbol", verifyRole(["Investor"]), removeStockFromPortfolio);

/**
 * @swagger
 * /portfolio/performance:
 *   get:
 *     tags:
 *       - Portfolio
 *     summary: Analyze portfolio performance
 *     description: Returns total investment, value, and return percentage.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Performance calculated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 performance:
 *                   type: object
 *                   properties:
 *                     totalInvestment:
 *                       type: number
 *                       example: 5000
 *                     totalValue:
 *                       type: number
 *                       example: 5500
 *                     returnPercentage:
 *                       type: number
 *                       example: 10
 *       500:
 *         description: Failed to calculate performance
 */
router.get("/performance", verifyRole(["Investor"]), getPortfolioPerformance);

/**
 * @swagger
 * /portfolio/alerts:
 *   post:
 *     tags:
 *       - Alerts
 *     summary: Set a price alert
 *     description: Sets a stock price alert for the authenticated user.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - symbol
 *               - targetPrice
 *             properties:
 *               symbol:
 *                 type: string
 *                 example: "GOOGL"
 *               targetPrice:
 *                 type: number
 *                 example: 2800
 *     responses:
 *       201:
 *         description: Alert set successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Price alert set"
 *       500:
 *         description: Failed to set alert
 */
router.post("/alerts", verifyRole(["Investor"]), setPriceAlert);

/**
 * @swagger
 * /portfolio/alerts/{id}:
 *   delete:
 *     tags:
 *       - Alerts
 *     summary: Delete a price alert
 *     description: Deletes an existing price alert by its document ID.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Alert document ID to delete
 *     responses:
 *       200:
 *         description: Alert deleted
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Price alert deleted"
 *       500:
 *         description: Failed to delete alert
 */
router.delete("/alerts/:id", verifyRole(["Investor"]), deletePriceAlert);

export default router;