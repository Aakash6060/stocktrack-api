import { Request, Response } from "express";
import { db } from "../../../config/firebase";

export const addStockToPortfolio = async (req: Request, res: Response): Promise<void>  => {
  const { symbol, quantity, averageBuyPrice } = req.body;
  const userId = req.user?.uid; 

  // Check if userId is available, meaning user is authenticated
  if (!userId) {
    res.status(401).json({ error: "User not authenticated" });
    return;  }

  try {
    // Add stock to the user's portfolio in Firestore
    await db.collection("portfolios").doc(userId).collection("stocks").add({
      symbol,
      quantity,
      averageBuyPrice,
    });
    res.status(201).json({ message: "Stock added to portfolio" });
  } catch (error) {
    res.status(500).json({ error: "Failed to add stock" });
  }
};
