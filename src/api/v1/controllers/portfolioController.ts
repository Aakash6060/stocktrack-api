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

/**
 * @route DELETE /portfolio/remove/:symbol
 * @description Removes a stock from the user's portfolio using the symbol.
 * @access Investor
 * 
 * @param {Request} req - Express request with symbol param
 * @param {Response} res - Express response
 * 
 * @returns {Promise<void>} Deletion result
 */
export const removeStockFromPortfolio = async (req: Request, res: Response): Promise<void> => {
  try {
    const { symbol } = req.params;
    const db = admin.firestore();

    const snapshot = await db.collection("portfolios").where("symbol", "==", symbol).get();

    if (snapshot.empty) {
      res.status(404).json({ message: "Stock not found" }); // 🔧 no return
      return;
    }

    const batch = db.batch();
    snapshot.forEach(doc => batch.delete(doc.ref));
    await batch.commit();

    res.status(200).json({ message: "Stock removed from portfolio" });
  } catch {
    res.status(500).json({ error: "Failed to remove stock" });
  }
};

/**
 * @route GET /portfolio/performance
 * @description Analyzes user's portfolio performance.
 * @access Investor
 * 
 * @returns {Promise<void>} Portfolio performance summary
 */
export const getPortfolioPerformance = async (req: Request, res: Response): Promise<void> => {
  try {
    const db = admin.firestore();
    const snapshot = await db.collection("portfolios").get();

    let totalInvestment = 0;
    snapshot.forEach(doc => {
      const data = doc.data();
      totalInvestment += data.quantity * data.averageBuyPrice;
    });

    // For now, assume static performance calculation
    const performance = {
      totalInvestment,
      totalValue: totalInvestment * 1.1, // Simulate 10% return
      returnPercentage: 10
    };

    res.status(200).json({ performance });
  } catch {
    res.status(500).json({ error: "Failed to calculate performance" });
  }
};
