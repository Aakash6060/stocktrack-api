import { Request, Response } from "express";
import admin from "../../../config/firebase";
import { getCache, setCache } from "../services/cache.service";

interface StockSearchQuery {
  q?: string;
}

export interface StockAlertBody {
  targetPrice: number;
}

interface StockData {
  symbol: string;
  price: number;
  lastUpdated: string;
}

interface HistoryData {
  date: string;
  price: number;
}

interface NewsArticle {
  title: string;
  source: string;
  url: string;
  date: string;
}

interface StockDocument {
  symbol: string;
  name: string;
}

/**
 * @route GET /api/v1/stocks/:symbol
 * @group Stocks - Real-time and historical stock data
 * @description Fetches real-time stock price data.
 * @access Public
 * 
 * @param {Request} req - Express request with stock `symbol` param
 * @param {string} req.params.symbol - Ticker symbol (e.g., AAPL)
 * @param {Response} res - Express response
 * 
 * @returns {Promise<void>} 200 OK with { symbol, price, currency, timestamp }; 404 if not found; 500 on failure
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
    const db: FirebaseFirestore.Firestore = admin.firestore();
    const doc: FirebaseFirestore.DocumentSnapshot = await db.collection("stocks").doc(symbol.toUpperCase()).get();

    if (!doc.exists) {
      res.status(404).json({ error: "Stock not found" });
      return;
    }

    const stock: StockData = doc.data() as StockData;

    const response: {
      symbol: string;
      price: number;
      currency: string;
      timestamp: string;
    } = {
      symbol: stock.symbol,
      price: stock.price,
      currency: "USD",
      timestamp: stock.lastUpdated,
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
 * @group Stocks - Real-time and historical stock data
 * @description Fetches recent stock price history (last 30 days).
 * @access Public
 * 
 * @param {Request} req - Express request with stock `symbol` param
 * @param {string} req.params.symbol - Ticker symbol (e.g., TSLA)
 * @param {Response} res - Express response
 * 
 * @returns {Promise<void>} 200 OK with { symbol, history: [{ date, price }] }; 500 on failure
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
    const db: FirebaseFirestore.Firestore = admin.firestore();
    const snapshot: FirebaseFirestore.QuerySnapshot = await db
      .collection("stocks")
      .doc(symbol.toUpperCase())
      .collection("history")
      .orderBy("date", "desc")
      .limit(30)
      .get();

    const history: HistoryData[] = snapshot.docs.map((doc): HistoryData => {
      const data: HistoryData = doc.data() as HistoryData;
      return {
        date: data.date,
        price: data.price,
      };
    });

    const response: { symbol: string; history: HistoryData[] } = {
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
 * @group Stocks - News and sentiment data
 * @description Fetches recent news articles related to the given stock symbol.
 * @access Public
 * 
 * @param {Request} req - Express request with stock `symbol` param
 * @param {Response} res - Express response
 * 
 * @returns {Promise<void>} 200 OK with { symbol, news: [{ title, source, url, date }] }; 500 on failure
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
    const db: FirebaseFirestore.Firestore = admin.firestore();
    const snapshot: FirebaseFirestore.QuerySnapshot = await db
      .collection("stocks")
      .doc(symbol.toUpperCase())
      .collection("news")
      .orderBy("date", "desc")
      .limit(10)
      .get();

    const news: NewsArticle[] = snapshot.docs.map((doc): NewsArticle => {
      const data: NewsArticle = doc.data() as NewsArticle;
      return {
        title: data.title,
        source: data.source,
        url: data.url,
        date: data.date,
      };
    });

    const response: { symbol: string; news: NewsArticle[] } = {
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
 * @group Stocks - News and sentiment data
 * @description Retrieves sector-wide market trend insights.
 * @access Public
 * 
 * @param {Request} req - Express request
 * @param {Response} res - Express response
 * 
 * @returns {Promise<void>} 200 OK with sector trend details; 500 on failure
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
    const db: FirebaseFirestore.Firestore = admin.firestore();
    const snapshot: FirebaseFirestore.QuerySnapshot = await db.collection("sectors").get();

    const trends: { sector: string; details: FirebaseFirestore.DocumentData }[] = snapshot.docs.map((doc) => ({
      sector: doc.id,
      details: doc.data(),
    }));

    const response: { trends: { sector: string; details: FirebaseFirestore.DocumentData }[] } = { trends };

    setCache(cacheKey, response);

    res.status(200).json({
      ...response,
      source: "FIRESTORE",
    });
  } catch {
    res.status(500).json({ error: "Failed to fetch market trends" });
  }
};

/**
 * @route GET /api/v1/stocks/market-trends
 * @group Stocks - News and sentiment data
 * @description Retrieves sector-wide market trend insights.
 * @access Public
 * 
 * @param {Request} req - Express request
 * @param {Response} res - Express response
 * 
 * @returns {Promise<void>} 200 OK with sector trend details; 500 on failure
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
    const db: FirebaseFirestore.Firestore = admin.firestore();
    const snapshot: FirebaseFirestore.QuerySnapshot = await db.collection("stocks").get();

    const results: StockDocument[] = snapshot.docs
      .map((doc) => doc.data() as StockDocument)
      .filter(
        (stock: StockDocument) =>
          (typeof stock.symbol === "string" && stock.symbol.toLowerCase().includes(query)) ||
          (typeof stock.name === "string" && stock.name.toLowerCase().includes(query))
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
 * @group Stocks - News and sentiment data
 * @description Analyzes and retrieves the latest sentiment data for the given stock.
 * @access Public
 * 
 * @param {Request} req - Express request with `symbol` param
 * @param {string} req.params.symbol - Ticker symbol (e.g., NFLX)
 * @param {Response} res - Express response
 * 
 * @returns {Promise<void>} 200 OK with sentiment data; 404 if not found; 500 on failure
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
    const db: FirebaseFirestore.Firestore = admin.firestore();
    const doc: FirebaseFirestore.DocumentSnapshot = await db
      .collection("stocks")
      .doc(symbol.toUpperCase())
      .collection("sentiment")
      .doc("latest")
      .get();

    if (!doc.exists) {
      res.status(404).json({ error: "Sentiment not found" });
      return;
    }

    const sentiment: FirebaseFirestore.DocumentData | undefined = doc.data();

    setCache(cacheKey, sentiment);

    res.status(200).json({
      ...sentiment,
      source: "FIRESTORE",
    });
  } catch {
    res.status(500).json({ error: "Failed to analyze sentiment" });
  }
};

/**
 * @route POST /api/v1/stocks/:symbol/alerts
 * @group Stocks - Alerts and triggers
 * @description Sets a price alert for the given stock.
 * @access Investor
 * 
 * @param {Request} req - Express request with `symbol` param and `targetPrice` in body
 * @param {string} req.params.symbol - Ticker symbol (e.g., MSFT)
 * @param {object} req.body
 * @param {number} req.body.targetPrice - Price at which the alert should be triggered
 * @example request - Set alert
 * {
 *   "targetPrice": 350
 * }
 * 
 * @param {Response} res - Express response
 * 
 * @returns {void} 201 Created with confirmation and alert ID; 400 if missing price; 500 on failure
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
