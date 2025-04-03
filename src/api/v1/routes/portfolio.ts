import { Router } from "express";
import { addStockToPortfolio } from "../controllers/portfolioController";

const router = Router();

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
 *               example: "AAPL"
 *             quantity:
 *               type: integer
 *               example: 10
 *             averageBuyPrice:
 *               type: number
 *               format: float
 *               example: 145.50
 *     responses:
 *       201:
 *         description: Stock added to portfolio successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Stock added to portfolio"
 *       500:
 *         description: Failed to add stock to portfolio
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Failed to add stock"
 */
router.post("/add-stock", addStockToPortfolio);

export default router;
