import { Request, Response } from "express";
import admin from "../../../config/firebase";

/**
 * @route POST /portfolio/add
 * @description Adds a stock to the user's portfolio.
 * @access Authenticated users
 * 
 * @param {Request} req - Express request object containing:
 *  - `symbol` (string): Ticker symbol of the stock.
 *  - `quantity` (number): Number of shares to add.
 *  - `averageBuyPrice` (number): Average price at which the stock was bought.
 * 
 * @param {Response} res - Express response object
 * 
 * @returns {Promise<void>} Responds with a success message or error.
 */
export const addStockToPortfolio = async (req: Request, res: Response): Promise<void> => {
  try {
    const { symbol, quantity, averageBuyPrice } = req.body as {
      symbol: string;
      quantity: number;
      averageBuyPrice: number;
    };

    const db: FirebaseFirestore.Firestore = admin.firestore();

    await db.collection("portfolios").add({
      symbol,
      quantity,
      averageBuyPrice,
    });

    res.status(201).json({ message: "Stock added to portfolio" });
  } catch {
    res.status(500).json({ error: "Failed to add stock" });
  }
};

/**
 * @route GET /portfolio
 * @description Retrieves the authenticated user's stock portfolio.
 * @access Investor
 * 
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * 
 * @returns {Promise<void>} List of portfolio stocks
 */
export const getUserPortfolio = async (req: Request, res: Response): Promise<void> => {
  try {
    const db: FirebaseFirestore.Firestore = admin.firestore();
    const portfolioSnapshot = await db.collection("portfolios").get();

    const portfolio = portfolioSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    res.status(200).json({ portfolio });
  } catch {
    res.status(500).json({ error: "Failed to fetch portfolio" });
  }
};