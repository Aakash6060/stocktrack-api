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
    const mockPrice = +(100 + Math.random() * 100).toFixed(2);

    res.status(200).json({
      symbol: symbol.toUpperCase(),
      price: mockPrice,
      currency: "USD",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch stock data" });
  }
};

/**
 * GET /api/v1/stocks/:symbol/history
 * @desc Return mock stock history data for a given symbol
 * @note Replace mock data with real stock history API integration in Milestone 2
 */
export const getStockHistory = async (req: Request, res: Response) => {
  const { symbol } = req.params;

  try {
    // Manually throw error for testing error handling
    if (symbol === 'error') {
      throw new Error("Simulated error");
    }

    const mockHistory = [
      { date: "2025-04-01", price: 145.50 },
      { date: "2025-04-02", price: 146.20 },
      { date: "2025-04-03", price: 144.80 },
    ];

    res.status(200).json({
      symbol: symbol.toUpperCase(),
      history: mockHistory,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch stock history" });
  }
};

export const getStockNews = async (req: Request, res: Response) => {
  const { symbol } = req.params;

  try {
    // Manually throw error for testing error handling
    if (symbol === 'error') {
      throw new Error("Simulated error");
    }

    const mockNews = [
      {
        title: "Apple announces new iPhone",
        source: "TechCrunch",
        url: "https://techcrunch.com/apple-new-iphone",
        date: "2025-04-03",
      },
      {
        title: "Apple stock surges after strong earnings",
        source: "CNBC",
        url: "https://cnbc.com/apple-stock-surges",
        date: "2025-04-02",
      },
    ];

    res.status(200).json({
      symbol: symbol.toUpperCase(),
      news: mockNews,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch stock news" });
  }
};
