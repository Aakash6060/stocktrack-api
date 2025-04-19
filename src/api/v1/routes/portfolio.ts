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
 *     description: Add a stock to the user's portfolio
 *     parameters:
 *       - in: body
 *         name: stock
 *         description: The stock information to add to the portfolio
 *         required: true
 *         schema:
 *           type: object
 *           required:
 *             - symbol
 *             - quantity
 *             - averageBuyPrice
 *           properties:
 *             symbol:
 *               type: string
 *               description: The stock symbol (e.g., "AAPL", "TSLA")
 *               example: "AAPL"
 *             quantity:
 *               type: integer
 *               description: The number of shares being added to the portfolio
 *               example: 10
 *             averageBuyPrice:
 *               type: number
 *               format: float
 *               description: The average price at which the stock was bought
 *               example: 145.50
 *     responses:
 *       201:
 *         description: Stock successfully added to portfolio
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Stock added to portfolio"
 *       500:
 *         description: Failed to add stock to portfolio due to server or database error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Failed to add stock to portfolio due to a database issue"
 */
router.post("/add-stock", verifyRole(["Investor"]), addStockToPortfolio);

/**
 * @swagger
 * /portfolio:
 *   get:
 *     tags:
 *       - Portfolio
 *     security:
 *       - bearerAuth: []
 *     description: Get all stocks in the user's portfolio
 *     responses:
 *       200:
 *         description: Portfolio retrieved
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
 *     security:
 *       - bearerAuth: []
 *     description: Remove a stock from portfolio by its symbol
 *     parameters:
 *       - in: path
 *         name: symbol
 *         required: true
 *         type: string
 *         description: Ticker symbol (e.g., "TSLA")
 *     responses:
 *       200:
 *         description: Stock removed
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
 *     security:
 *       - bearerAuth: []
 *     description: Analyze the user's portfolio performance
 *     responses:
 *       200:
 *         description: Performance summary returned
 *       500:
 *         description: Failed to calculate performance
 */
router.get("/performance", verifyRole(["Investor"]), getPortfolioPerformance);

/**
 * @swagger
 * /portfolio/alerts:
 *   post:
 *     tags:
 *       - Portfolio
 *     security:
 *       - bearerAuth: []
 *     description: Set a price alert for a stock
 *     parameters:
 *       - in: body
 *         name: alert
 *         required: true
 *         schema:
 *           type: object
 *           required:
 *             - symbol
 *             - targetPrice
 *           properties:
 *             symbol:
 *               type: string
 *               example: "GOOG"
 *             targetPrice:
 *               type: number
 *               example: 2800.00
 *     responses:
 *       201:
 *         description: Alert created
 *       500:
 *         description: Failed to set alert
 */
router.post("/alerts", verifyRole(["Investor"]), setPriceAlert);

/**
 * @swagger
 * /portfolio/alerts/{id}:
 *   delete:
 *     tags:
 *       - Portfolio
 *     security:
 *       - bearerAuth: []
 *     description: Delete a price alert by its ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         type: string
 *         description: Alert document ID
 *     responses:
 *       200:
 *         description: Alert deleted
 *       500:
 *         description: Failed to delete alert
 */
router.delete("/alerts/:id", verifyRole(["Investor"]), deletePriceAlert);

export default router;