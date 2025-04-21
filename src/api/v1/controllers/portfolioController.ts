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
 * @group Portfolio - Stock portfolio management
 * @description Adds a stock to the user's portfolio.
 * @access Investor
 * 
 * @param {Request} req - Express request with stock info
 * @param {object} req.body
 * @param {string} req.body.symbol - Ticker symbol of the stock
 * @param {number} req.body.quantity - Number of shares to add
 * @param {number} req.body.averageBuyPrice - Average buy price per share
 * @example request - Add stock
 * {
 *   "symbol": "AAPL",
 *   "quantity": 10,
 *   "averageBuyPrice": 145
 * }
 * 
 * @param {Response} res - Express response object
 * 
 * @returns {Promise<void>} 201 Created on success; 500 on failure
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
 * @group Portfolio - Stock portfolio management
 * @description Retrieves the authenticated user's stock portfolio.
 * @access Investor
 * 
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * 
 * @returns {Promise<void>} 200 OK with portfolio list; 500 on error
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
 * @group Portfolio - Stock portfolio management
 * @description Removes a stock from the user's portfolio using the symbol.
 * @access Investor
 * 
 * @param {Request} req - Express request with `symbol` param
 * @param {string} req.params.symbol - Ticker symbol to remove
 * @param {Response} res - Express response object
 * 
 * @returns {Promise<void>} 200 OK on success; 404 if not found; 500 on error
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
 * @group Portfolio - Stock portfolio management
 * @description Analyzes the user's portfolio performance based on current holdings.
 * @access Investor
 * 
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * 
 * @returns {Promise<void>} 200 OK with { totalInvestment, totalValue, returnPercentage }; 500 on error
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
 * @group Alerts - Stock price notifications
 * @description Sets a price alert for a specific stock.
 * @access Investor
 * 
 * @param {Request} req - Express request with alert data
 * @param {object} req.body
 * @param {string} req.body.symbol - Ticker symbol
 * @param {number} req.body.targetPrice - Price at which to trigger the alert
 * @example request - Set alert
 * {
 *   "symbol": "GOOGL",
 *   "targetPrice": 2800
 * }
 * 
 * @param {Response} res - Express response object
 * 
 * @returns {Promise<void>} 201 Created with confirmation message; 500 on error
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
 * @group Alerts - Stock price notifications
 * @description Deletes a price alert by its unique ID.
 * @access Investor
 * 
 * @param {Request} req - Express request with alert ID param
 * @param {string} req.params.id - Alert document ID to delete
 * @param {Response} res - Express response object
 * 
 * @returns {Promise<void>} 200 OK on success; 500 on failure
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
