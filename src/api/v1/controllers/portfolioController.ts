import { Request, Response } from "express";
import admin from "../../../config/firebase"; 

export const addStockToPortfolio = async (req: Request, res: Response) => {
  const { symbol, quantity, averageBuyPrice } = req.body;

  try {
    const db = admin.firestore();
    await db.collection("portfolios").add({
      symbol,
      quantity,
      averageBuyPrice,
    });
    res.status(201).json({ message: "Stock added to portfolio" });
  } catch (error) {
    res.status(500).json({ error: "Failed to add stock" });
  }
};
