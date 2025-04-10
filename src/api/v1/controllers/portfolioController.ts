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
