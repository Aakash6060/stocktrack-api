import { Request, Response } from "express";
import admin from "../../../config/firebase";
import { getCache, setCache } from "../services/cache.service";

/**
 * @route GET /api/v1/stocks/:symbol
 * @description Returns stock data for a given symbol from Firestore.
 * @param req.params.symbol - Stock ticker symbol (e.g., AAPL, GOOGL)
 * @returns JSON object with current stock price and metadata.
 */
export const getStockData = async (req: Request<{ symbol: string }>, res: Response): Promise<void> => {
  const { symbol } = req.params;
  const cacheKey: string = `stock_data_${symbol.toLowerCase()}`;

  const cached: unknown = getCache(cacheKey);
  if (cached) {
    res.status(200).json({
      ...cached,
      source: "CACHE",
    });
    return;
  }

  try {
    const db = admin.firestore();
    const doc = await db.collection("stocks").doc(symbol.toUpperCase()).get();

    if (!doc.exists) {
      res.status(404).json({ error: "Stock not found" });
      return;
    }

    const stock = doc.data();

    const response: {
      symbol: string;
      price: number;
      currency: string;
      timestamp: string;
    } = {
      symbol: stock?.symbol,
      price: stock?.price,
      currency: "USD",
      timestamp: stock?.lastUpdated,
    };

    setCache(cacheKey, response);

    res.status(200).json({
      ...response,
      source: "FIRESTORE",
    });
  } catch {
    res.status(500).json({ error: "Failed to fetch stock data" });
  }
};

/**
 * @route GET /api/v1/stocks/:symbol/history
 * @description Returns historical price data for the given stock symbol.
 * @param req.params.symbol - Stock ticker symbol.
 * @returns JSON object containing date-wise stock price history.
 */
export const getStockHistory = async (req: Request<{ symbol: string }>, res: Response): Promise<void> => {
  const { symbol } = req.params;
  const cacheKey: string = `stock_history_${symbol.toLowerCase()}`;

  const cached: unknown = getCache(cacheKey);
  if (cached) {
    res.status(200).json({
      ...cached,
      source: "CACHE",
    });
    return;
  }

  try {
    const db = admin.firestore();
    const snapshot = await db
      .collection("stocks")
      .doc(symbol.toUpperCase())
      .collection("history")
      .orderBy("date", "desc")
      .limit(30)
      .get();

      const history = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          date: data.date as string,
          price: data.price as number,
        };
      });

    const response: {
      symbol: string;
      history: { date: string; price: number }[];
    } = {
      symbol: symbol.toUpperCase(),
      history,
    };

    setCache(cacheKey, response);

    res.status(200).json({
      ...response,
      source: "FIRESTORE",
    });
  } catch {
    res.status(500).json({ error: "Failed to fetch stock history" });
  }
};

/**
 * @route GET /api/v1/stocks/:symbol/news
 * @description Returns financial news related to a given stock symbol.
 * @param req.params.symbol - Stock ticker symbol.
 * @returns JSON object containing a list of recent news articles.
 */
export const getStockNews = async (req: Request<{ symbol: string }>, res: Response): Promise<void> => {
  const { symbol } = req.params;
  const cacheKey: string = `stock_news_${symbol.toLowerCase()}`;

  const cached: unknown = getCache(cacheKey);
  if (cached) {
    res.status(200).json({
      ...cached,
      source: "CACHE",
    });
    return;
  }

  try {
    const db = admin.firestore();
    const snapshot = await db
      .collection("stocks")
      .doc(symbol.toUpperCase())
      .collection("news")
      .orderBy("date", "desc")
      .limit(10)
      .get();

  const news = snapshot.docs.map(doc => {
    const data = doc.data();
    return {
      title: data.title as string,
      source: data.source as string,
      url: data.url as string,
      date: data.date as string,
    };
  });

    const response: {
      symbol: string;
      news: { title: string; source: string; url: string; date: string }[];
    } = {
      symbol: symbol.toUpperCase(),
      news,
    };

    setCache(cacheKey, response);

    res.status(200).json({
      ...response,
      source: "FIRESTORE",
    });
  } catch {
    res.status(500).json({ error: "Failed to fetch stock news" });
  }
};

/**
 * @route GET /api/v1/stocks/market-trends
 * @description Returns current stock market trends from sector collection.
 */
export const getMarketTrends = async (_req: Request, res: Response): Promise<void> => {
  const cacheKey: string = "stock_market_trends";

  const cached: unknown = getCache(cacheKey);
  if (cached) {
    res.status(200).json({
      ...cached,
      source: "CACHE",
    });
    return;
  }

  try {
    const db = admin.firestore();
    const snapshot = await db.collection("sectors").get();

    const trends = snapshot.docs.map(doc => ({
      sector: doc.id,
      details: doc.data(),
    }));

    const response: { trends: { sector: string; details: unknown }[] } = { trends };

    setCache(cacheKey, response);

    res.status(200).json({
      ...response,
      source: "FIRESTORE",
    });
  } catch {
    res.status(500).json({ error: "Failed to fetch market trends" });
  }
};

interface StockSearchQuery {
  q?: string;
}

/**
 * @route GET /api/v1/stocks/search
 * @description Searches Firestore stock list by symbol or name (case-insensitive).
 */
export const searchStocks = async (
  req: Request<Record<string, unknown>, unknown, unknown, StockSearchQuery>,
  res: Response
): Promise<void> => {
  const query: string = typeof req.query.q === "string" ? req.query.q.toLowerCase() : "";
  const cacheKey: string = `stock_search_${query}`;

  const cached: unknown = getCache(cacheKey);
  if (cached) {
    res.status(200).json({
      ...cached,
      source: "CACHE",
    });
    return;
  }

  try {
    const db = admin.firestore();
    const snapshot = await db.collection("stocks").get();

    const results = snapshot.docs
      .map(doc => doc.data())
      .filter(
        stock =>
          stock.symbol.toLowerCase().includes(query) ||
          stock.name.toLowerCase().includes(query)
      );

    const response: { results: { symbol: string; name: string }[] } = {
      results: results.map(({ symbol, name }) => ({ symbol, name })),
    };

    setCache(cacheKey, response);

    res.status(200).json({
      ...response,
      source: "FIRESTORE",
    });
  } catch {
    res.status(500).json({ error: "Failed to search stocks" });
  }
};

/**
 * @route GET /api/v1/stocks/:symbol/sentiment
 * @description Returns sentiment analysis result for a given stock.
 */
export const getStockSentiment = async (req: Request<{ symbol: string }>, res: Response): Promise<void> => {
  const { symbol } = req.params;
  const cacheKey: string = `stock_sentiment_${symbol.toLowerCase()}`;

  const cached: unknown = getCache(cacheKey);
  if (cached) {
    res.status(200).json({
      ...cached,
      source: "CACHE",
    });
    return;
  }

  try {
    const db = admin.firestore();
    const doc = await db
      .collection("stocks")
      .doc(symbol.toUpperCase())
      .collection("sentiment")
      .doc("latest")
      .get();

    if (!doc.exists) {
      res.status(404).json({ error: "Sentiment not found" });
      return;
    }

    const sentiment = doc.data();

    setCache(cacheKey, sentiment);

    res.status(200).json({
      ...sentiment,
      source: "FIRESTORE",
    });
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
