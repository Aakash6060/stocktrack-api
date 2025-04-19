import { Request, Response } from "express";
import admin from "../../../config/firebase";

/**
 * @route GET /analytics/market
 * @description View overall stock market performance.
 * @access Analyst
 * 
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * 
 * @returns {Promise<void>} List of market performance data
 */
export const getMarketPerformance = async (req: Request, res: Response): Promise<void> => {
  try {
    const db: FirebaseFirestore.Firestore = admin.firestore();
    const snapshot = await db.collection("marketPerformance").get();

    const data = snapshot.docs.map(doc => doc.data());

    res.status(200).json({ data });
  } catch {
    res.status(500).json({ error: "Failed to retrieve market performance" });
  }
};
