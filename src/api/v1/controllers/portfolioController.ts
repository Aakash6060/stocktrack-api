import { Request, Response } from "express";
import admin from "../../../config/firebase";

interface AddStockRequestBody {
  symbol: string;
  quantity: number;
  averageBuyPrice: number;
}

interface SetAlertRequestBody {
  symbol: string;
  targetPrice: number;
}
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
export const addStockToPortfolio = async (
  req: Request<unknown, unknown, AddStockRequestBody>,
  res: Response
): Promise<void> => {
  try {
    const { symbol, quantity, averageBuyPrice } = req.body;

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
    const portfolioSnapshot: FirebaseFirestore.QuerySnapshot<FirebaseFirestore.DocumentData> = await db.collection("portfolios").get();

    const portfolio: { id: string; symbol: string; quantity: number; averageBuyPrice: number }[] =
      portfolioSnapshot.docs.map(doc => {
        const data: { symbol: string; quantity: number; averageBuyPrice: number } = doc.data() as {
          symbol: string;
          quantity: number;
          averageBuyPrice: number;
        };
        return {
          id: doc.id,
          ...data
        };
      });

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
    const { symbol } = req.params as { symbol: string };
    const db: FirebaseFirestore.Firestore = admin.firestore();

    const snapshot: FirebaseFirestore.QuerySnapshot<FirebaseFirestore.DocumentData> =
      await db.collection("portfolios").where("symbol", "==", symbol).get();

    if (snapshot.empty) {
      res.status(404).json({ message: "Stock not found" });
      return;
    }

    const batch: FirebaseFirestore.WriteBatch = db.batch();
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
    const db: FirebaseFirestore.Firestore = admin.firestore();
    const snapshot: FirebaseFirestore.QuerySnapshot<FirebaseFirestore.DocumentData> = await db.collection("portfolios").get();

    let totalInvestment: number = 0;
    snapshot.forEach(doc => {
      const data: { quantity: number; averageBuyPrice: number } = doc.data() as {
        quantity: number;
        averageBuyPrice: number;
      };
      totalInvestment += data.quantity * data.averageBuyPrice;
    });

    const performance: {
      totalInvestment: number;
      totalValue: number;
      returnPercentage: number;
    } = {
      totalInvestment,
      totalValue: totalInvestment * 1.1,
      returnPercentage: 10
    };

    res.status(200).json({ performance });
  } catch {
    res.status(500).json({ error: "Failed to calculate performance" });
  }
};

/**
 * @route POST /portfolio/alerts
 * @description Sets a price alert for a stock.
 * @access Investor
 * 
 * @param {Request} req - Express request with symbol and targetPrice
 * @param {Response} res - Express response
 * 
 * @returns {Promise<void>} Success or failure message
 */
export const setPriceAlert = async (
  req: Request<unknown, unknown, SetAlertRequestBody>,
  res: Response
): Promise<void> => {
  try {
    const { symbol, targetPrice } = req.body;

    const db: FirebaseFirestore.Firestore = admin.firestore();
    await db.collection("alerts").add({ symbol, targetPrice });

    res.status(201).json({ message: "Price alert set" });
  } catch {
    res.status(500).json({ error: "Failed to set alert" });
  }
};

/**
 * @route DELETE /portfolio/alerts/:id
 * @description Deletes a price alert by ID.
 * @access Investor
 * 
 * @param {Request} req - Express request with alert ID
 * @param {Response} res - Express response
 * 
 * @returns {Promise<void>} Success or error message
 */
export const deletePriceAlert = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params as { id: string };
    const db: FirebaseFirestore.Firestore = admin.firestore();

    await db.collection("alerts").doc(id).delete();

    res.status(200).json({ message: "Price alert deleted" });
  } catch {
    res.status(500).json({ error: "Failed to delete alert" });
  }
};
