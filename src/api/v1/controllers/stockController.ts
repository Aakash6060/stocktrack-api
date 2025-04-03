import { Request, Response } from "express";

/**
 * GET /api/v1/stocks/:symbol
 * @desc Return mock stock data for a given symbol
 * @note Replace mock data with real stock API integration in Milestone 2
 */
export const getStockData = async (req: Request, res: Response) => {
  const { symbol } = req.params;

  try {
    // TODO: Replace with real-time stock API integration (e.g., Finnhub or Alpha Vantage)
    const mockPrice = 150.25;

    res.status(200).json({
      symbol,
      price: mockPrice,
      currency: "USD",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch stock data" });
  }
};