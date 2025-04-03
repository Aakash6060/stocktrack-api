import { Request, Response } from "express";

/**
 * @route GET /api/v1/stocks/:symbol
 * @description Returns mock stock data for a given symbol.
 * @param req.params.symbol - Stock ticker symbol (e.g., AAPL, GOOGL)
 * @returns JSON object with current stock price and metadata.
 * @note This is a placeholder. Replace with a real-time stock API (e.g., Finnhub, Alpha Vantage) in Milestone 2.
 */
export const getStockData = async (req: Request, res: Response) => {
  const { symbol } = req.params;

  try {
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
 * @route GET /api/v1/stocks/:symbol/history
 * @description Returns mock historical price data for the given stock symbol.
 * @param req.params.symbol - Stock ticker symbol.
 * @returns JSON object containing date-wise stock price history.
 * @note Replace with real historical data API integration in Milestone 2.
 */
export const getStockHistory = async (req: Request, res: Response) => {
  const { symbol } = req.params;

  try {
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

/**
 * @route GET /api/v1/stocks/:symbol/news
 * @description Returns mock financial news related to a given stock symbol.
 * @param req.params.symbol - Stock ticker symbol.
 * @returns JSON object containing a list of recent news articles.
 * @note Replace with integration from a financial news API (e.g., NewsAPI, Finnhub) in Milestone 2.
 */
export const getStockNews = async (req: Request, res: Response) => {
  const { symbol } = req.params;

  try {
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