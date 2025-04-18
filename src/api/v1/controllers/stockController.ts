import { Request, Response } from "express";

/**
 * @route GET /api/v1/stocks/:symbol
 * @description Returns mock stock data for a given symbol.
 * @param req.params.symbol - Stock ticker symbol (e.g., AAPL, GOOGL)
 * @returns JSON object with current stock price and metadata.
 * @note This is a placeholder. Replace with a real-time stock API (e.g., Finnhub, Alpha Vantage) in Milestone 2.
 */
export const getStockData = (req: Request<{ symbol: string }>, res: Response): void => {
  const { symbol } = req.params;

  try {
    const mockPrice: number = +(100 + Math.random() * 100).toFixed(2);

    res.status(200).json({
      symbol: symbol.toUpperCase(),
      price: mockPrice,
      currency: "USD",
      timestamp: new Date().toISOString(),
    });
  } catch {
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
export const getStockHistory = (req: Request<{ symbol: string }>, res: Response): void => {
  const { symbol } = req.params;

  try {
    if (symbol === "error") {
      throw new Error("Simulated error");
    }

    const mockHistory: { date: string; price: number }[] = [
      { date: "2025-04-01", price: 145.5 },
      { date: "2025-04-02", price: 146.2 },
      { date: "2025-04-03", price: 144.8 },
    ];

    res.status(200).json({
      symbol: symbol.toUpperCase(),
      history: mockHistory,
    });
  } catch {
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
export const getStockNews = (req: Request<{ symbol: string }>, res: Response): void => {
  const { symbol } = req.params;

  try {
    if (symbol === "error") {
      throw new Error("Simulated error");
    }

    const mockNews: { title: string; source: string; url: string; date: string }[] = [
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
  } catch {
    res.status(500).json({ error: "Failed to fetch stock news" });
  }
};

/**
 * @route GET /api/v1/stocks/market-trends
 * @description Returns mock data for current stock market trends.
 */
export const getMarketTrends = (_req: Request, res: Response): void => {
  try {
    const mockTrends: { sector: string; trend: string; changePercent: string }[] = [
      { sector: "Technology", trend: "Up", changePercent: "+1.5%" },
      { sector: "Healthcare", trend: "Down", changePercent: "-0.8%" },
      { sector: "Finance", trend: "Neutral", changePercent: "0.0%" },
    ];

    res.status(200).json({ trends: mockTrends });
  } catch {
    res.status(500).json({ error: "Failed to fetch market trends" });
  }
};

interface StockSearchQuery {
  q?: string;
}

/**
 * @route GET /api/v1/stocks/search
 * @description Searches mock stock list by symbol or name (case-insensitive).
 */
export const searchStocks = (
  req: Request<Record<string, unknown>, unknown, unknown, StockSearchQuery>,
  res: Response
): void => {
  const query: string = typeof req.query.q === 'string' ? req.query.q.toLowerCase() : '';

  try {
    const mockStocks: { symbol: string; name: string }[] = [
      { symbol: "AAPL", name: "Apple Inc." },
      { symbol: "GOOGL", name: "Alphabet Inc." },
      { symbol: "TSLA", name: "Tesla Inc." },
      { symbol: "AMZN", name: "Amazon.com Inc." },
    ];

    const results: { symbol: string; name: string }[] = mockStocks.filter(
      (stock) =>
        stock.symbol.toLowerCase().includes(query) ||
        stock.name.toLowerCase().includes(query)
    );

    res.status(200).json({ results });
  } catch {
    res.status(500).json({ error: "Failed to set stock alert" });
  }  
};

/**
 * @route GET /api/v1/stocks/:symbol/sentiment
 * @description Returns mock sentiment analysis result for a given stock.
 */
export const getStockSentiment = (req: Request<{ symbol: string }>, res: Response): void => {
  const { symbol } = req.params;

  try {
    const mockSentiment: {
      symbol: string;
      sentimentScore: number;
      sentiment: string;
      summary: string;
    } = {
      symbol: symbol.toUpperCase(),
      sentimentScore: 0.78,
      sentiment: "Positive",
      summary:
        "Most recent news articles reflect positive sentiment toward the stock.",
    };

    res.status(200).json(mockSentiment);
  } catch {
    res.status(500).json({ error: "Failed to analyze sentiment" });
  }
};

export interface StockAlertBody {
  targetPrice: number;
}

/**
 * @route POST /api/v1/stocks/:symbol/alerts
 * @description Mocks setting a price alert for a given stock (Investor only).
 */
export const setStockAlert = (
  req: Request<{ symbol: string }, unknown, Partial<StockAlertBody>>,
  res: Response
): void => {
  const { symbol } = req.params;
  const { targetPrice } = req.body;

  try {
    if (!targetPrice) {
      res.status(400).json({ error: "targetPrice is required" });
      return;
    }

    const mockAlertId: string = `alert_${symbol}_${Date.now()}`;

    res.status(201).json({
      message: `Alert set for ${symbol.toUpperCase()} at price $${targetPrice}`,
      alertId: mockAlertId,
    });
  } catch {
    res.status(500).json({ error: "Failed to set stock alert" });
  }
};