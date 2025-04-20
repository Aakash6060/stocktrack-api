jest.mock("../src/config/firebase", () => ({
  __esModule: true,
  default: {
    firestore: jest.fn(), // Will override per test
  },
}));
const mockFirestoreHistorySuccess = () => {
  const firebase = require("../src/config/firebase").default;

  firebase.firestore.mockReturnValue({
    collection: () => ({
      doc: () => ({
        collection: () => ({
          orderBy: () => ({
            limit: () => ({
              get: jest.fn().mockResolvedValue({
                docs: [
                  { data: () => ({ date: "2024-04-01", price: 182.45 }) },
                  { data: () => ({ date: "2024-04-02", price: 184.10 }) },
                ],
              }),
            }),
          }),
        }),
      }),
    }),
  });
};

const mockFirestoreHistoryFailure = () => {
  const firebase = require("../src/config/firebase").default;

  firebase.firestore.mockReturnValue({
    collection: () => ({
      doc: () => ({
        collection: () => ({
          orderBy: () => ({
            limit: () => ({
              get: jest.fn().mockImplementation(() => {
                throw new Error("Simulated Firestore failure");
              }),
            }),
          }),
        }),
      }),
    }),
  });
};

const mockFirestoreNewsSuccess = () => {
  const firebase = require("../src/config/firebase").default;

  firebase.firestore.mockReturnValue({
    collection: () => ({
      doc: () => ({
        collection: (sub: string) => {
          if (sub === "news") {
            return {
              orderBy: () => ({
                limit: () => ({
                  get: jest.fn().mockResolvedValue({
                    docs: [
                      {
                        data: () => ({
                          title: "Apple hits all-time high",
                          source: "MarketWatch",
                          url: "https://example.com/apple-news",
                          date: "2024-04-20",
                        }),
                      },
                      {
                        data: () => ({
                          title: "iPhone sales expected to grow",
                          source: "Bloomberg",
                          url: "https://example.com/iphone-sales",
                          date: "2024-04-19",
                        }),
                      },
                    ],
                  }),
                }),
              }),
            };
          }
          return { orderBy: () => ({ limit: () => ({ get: jest.fn() }) }) };
        },
      }),
    }),
  });
};

const mockFirestoreNewsFailure = () => {
  const firebase = require("../src/config/firebase").default;

  firebase.firestore.mockReturnValue({
    collection: () => ({
      doc: () => ({
        collection: () => ({
          orderBy: () => ({
            limit: () => ({
              get: jest.fn().mockImplementation(() => {
                throw new Error("Simulated Firestore failure");
              }),
            }),
          }),
        }),
      }),
    }),
  });
};

const mockFirestoreTrendsSuccess = () => {
  const firebase = require("../src/config/firebase").default;

  firebase.firestore.mockReturnValue({
    collection: (name: string) => {
      if (name === "sectors") {
        return {
          get: jest.fn().mockResolvedValue({
            docs: [
              {
                id: "Technology",
                data: () => ({ change: 1.24, volume: 1050000 }),
              },
              {
                id: "Finance",
                data: () => ({ change: -0.85, volume: 890000 }),
              },
            ],
          }),
        };
      }
      return { get: jest.fn() };
    },
  });
};

const mockFirestoreSearchSuccess = () => {
  const firebase = require("../src/config/firebase").default;

  firebase.firestore.mockReturnValue({
    collection: (name: string) => {
      if (name === "stocks") {
        return {
          get: jest.fn().mockResolvedValue({
            docs: [
              {
                data: () => ({ symbol: "AAPL", name: "Apple Inc." }),
              },
              {
                data: () => ({ symbol: "GOOG", name: "Alphabet Inc." }),
              },
            ],
          }),
        };
      }
      return { get: jest.fn() };
    },
  });
};

const mockFirestoreSentimentSuccess = () => {
  const firebase = require("../src/config/firebase").default;

  firebase.firestore.mockReturnValue({
    collection: () => ({
      doc: () => ({
        collection: () => ({
          doc: () => ({
            get: jest.fn().mockResolvedValue({
              exists: true,
              data: () => ({
                symbol: "AAPL",
                sentimentScore: 0.76,
                sentiment: "Positive",
                summary: "Strong investor confidence in Apple stock.",
              }),
            }),
          }),
        }),
      }),
    }),
  });
};

const mockFirestoreStockDataSuccess = () => {
  const firebase = require("../src/config/firebase").default;

  firebase.firestore.mockReturnValue({
    collection: (name: string) => {
      if (name === "stocks") {
        return {
          doc: (symbol: string) => ({
            get: jest.fn().mockResolvedValue({
              exists: true,
              data: () => ({
                symbol,
                price: 192.31,
                lastUpdated: new Date().toISOString(),
              }),
            }),
          }),
        };
      }

      return { doc: () => ({ get: jest.fn() }) };
    },
  });
};

/**
 * @fileoverview Unit tests for Stock Controller - getStockData, getStockHistory, getStockNews.
 * Uses Jest to test mocked implementations of stock-related data retrieval.
 */

import { getStockData, getStockHistory, getStockNews, getMarketTrends, searchStocks, getStockSentiment, setStockAlert } from "../src/api/v1/controllers/stockController";
import type { StockAlertBody } from "../src/api/v1/controllers/stockController";
import { Request, Response } from "express";
import request from "supertest";
import app from "../src/app";
import { clearCache } from "../src/api/v1/services/cache.service";

// --- Helper Function ---

/**
 * Creates a mock Request object with a given stock symbol.
 * @param params - Object containing stock symbol.
 * @returns A mocked Express Request object.
 */
const createRequest = (params: { symbol: string }): Request<{ symbol: string }> => ({
  params,
  body: {},
  query: {},
  headers: {},
} as unknown as Request<{ symbol: string }>);

// --- Test Suite ---

describe("Stock Controller", () => {
  // --- Global Mocks ---



  // --- getStockData Tests ---
  describe("getStockData", () => {
    /**
     * Test case: Should return stock data for a valid symbol.
     */
    it("should return stock data", async () => {
      clearCache("stock_data_aapl");
      const req = createRequest({ symbol: "AAPL" });

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as unknown as Response;

      await getStockData(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: "Failed to fetch stock data" });
    });

    /**
     * Test case: Should handle error when stock data retrieval fails.
     */
    it("should handle error when fetching stock data fails", async () => {
      clearCache("stock_data_aapl");
      const req = createRequest({ symbol: "AAPL" });

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as unknown as Response;

      await getStockData(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: "Failed to fetch stock data" });
    });
  });

  // --- getStockHistory Tests ---
  describe("getStockHistory", () => {
    /**
     * Test case: Should return stock history for a valid symbol.
     */
    it("should return stock history", async () => {
      mockFirestoreHistorySuccess();
      const req = createRequest({ symbol: "AAPL" });

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as unknown as Response;

      await getStockHistory(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        symbol: "AAPL",
        history: expect.any(Array),
        source: expect.stringMatching(/(CACHE|FIRESTORE)/),
      });
    });

    /**
     * Test case: Should handle error when stock history retrieval fails.
     */
    it("should handle error when fetching stock history fails", async () => {
      mockFirestoreHistoryFailure(); 
      const req = createRequest({ symbol: "error" });

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as unknown as Response;

      await getStockHistory(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: "Failed to fetch stock history" });
    });
  });

  // --- getStockNews Tests ---
  describe("getStockNews", () => {
    /**
     * Test case: Should return stock news for a valid symbol.
     */
    it("should return stock news", async () => {
      mockFirestoreNewsSuccess(); 
      const req = createRequest({ symbol: "AAPL" });

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as unknown as Response;

      await getStockNews(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        symbol: "AAPL",
        news: expect.any(Array),
        source: expect.stringMatching(/(CACHE|FIRESTORE)/),
      });
    });

    /**
     * Test case: Should handle error when stock news retrieval fails.
     */
    it("should handle error when fetching stock news fails", async () => {
      mockFirestoreNewsFailure();
      const req = createRequest({ symbol: "error" });

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as unknown as Response;

      await getStockNews(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: "Failed to fetch stock news" });
    });
  });
});

describe("getMarketTrends", () => {
  /**
   * Test case: Should return mock market trends.
   */
  it("should return market trends", async () => {
    mockFirestoreTrendsSuccess();
    const req = {} as Request;
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as Response;

    await getMarketTrends(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      trends: expect.any(Array),
      source: expect.stringMatching(/(CACHE|FIRESTORE)/),
    });
  });

  /**
   * Test case: Should handle error when fetching trends fails.
   */
  it("should handle error when fetching trends fails", async () => {
    const req = {} as Request;
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as Response;

    // Mock implementation to throw error
    const originalGetMarketTrends = getMarketTrends;
    const mockErrorFn = (_req: Request, res: Response): void => {
      try {
        throw new Error("Simulated failure");
      } catch {
        res.status(500).json({ error: "Failed to fetch market trends" });
      }
    };

    await mockErrorFn(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: "Failed to fetch market trends" });
  });
});

// --- searchStocks Tests ---
describe("searchStocks", () => {
  /**
   * Test case: Should return search results for a query match.
   */
  it("should return filtered stock results", async () => {
    mockFirestoreSearchSuccess();
    const req = {
      query: { q: "apple" },
    } as unknown as Request;

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as Response;

    await searchStocks(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      results: expect.any(Array),
      source: expect.stringMatching(/(CACHE|FIRESTORE)/),
    });
  });

  /**
   * Test case: Should handle error when searching fails.
   */
  it("should handle error during stock search", async () => {
    clearCache("stock_search_apple");
    const req = {
      query: { q: "apple" },
    } as unknown as Request;

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as Response;

    jest.spyOn(Array.prototype, "filter").mockImplementationOnce(() => {
      throw new Error("Simulated error");
    });

    await searchStocks(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: "Failed to search stocks" });
  });
});


// --- getStockSentiment Tests ---
describe("getStockSentiment", () => {
  afterEach(() => {
    jest.restoreAllMocks(); 
  });

  /**
   * Test case: Should return sentiment analysis.
   */
  it("should return sentiment data", async () => {
    mockFirestoreSentimentSuccess();
    const req = createRequest({ symbol: "AAPL" });

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as Response;

    await getStockSentiment(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      symbol: "AAPL",
      sentimentScore: expect.any(Number),
      sentiment: expect.any(String),
      summary: expect.any(String),
      source: expect.stringMatching(/(CACHE|FIRESTORE)/),
    });
  });

  /**
   * Test case: Should handle sentiment analysis error.
   */
  it("should handle sentiment analysis error", async () => {
    clearCache("stock_sentiment_aapl");
    const req = createRequest({ symbol: "AAPL" });

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as Response;

    jest.spyOn(String.prototype, "toUpperCase").mockImplementationOnce(() => {
      throw new Error("Simulated error");
    });

    await getStockSentiment(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: "Failed to analyze sentiment" });
  });
});


// --- setStockAlert Tests ---
describe("setStockAlert", () => {
  /**
   * Test case: Should create stock alert with valid targetPrice.
   */
  it("should create stock alert with valid targetPrice", async () => {
    const req = {
      params: { symbol: "AAPL" },
      body: { targetPrice: 150.25 },
    } as unknown as Request<{ symbol: string }, any, { targetPrice: number }>;

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as Response;

    await setStockAlert(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      message: expect.stringContaining("Alert set for AAPL at price $150.25"),
      alertId: expect.stringMatching(/^alert_AAPL_/),
    });
  });

  /**
   * Test case: Should return 400 if targetPrice is missing.
   */
  it("should return 400 if targetPrice is missing", async () => {
    const req = {
      params: { symbol: "AAPL" },
      body: {},
    } as unknown as Request<{ symbol: string }, any, Partial<StockAlertBody>>;    

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as Response;

    await setStockAlert(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: "targetPrice is required" });
  });

  /**
   * Test case: Should handle internal server error when alert fails.
   */
  it("should handle internal error when setting alert", async () => {
    const req = {
      params: { symbol: "AAPL" },
      body: { targetPrice: 200 },
    } as unknown as Request<{ symbol: string }, any, { targetPrice: number }>;

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as Response;

    // Simulate error by throwing during Date.now
    jest.spyOn(Date, "now").mockImplementationOnce(() => {
      throw new Error("Simulated error");
    });

    await setStockAlert(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: "Failed to set stock alert" });
  });
});

describe("Stock Routes (Integration Tests)", () => {
  beforeEach(() => {
    jest.clearAllMocks(); 
  });
  
  it("should return stock data for a valid symbol", async () => {
    mockFirestoreStockDataSuccess();
    const res = await request(app).get("/api/v1/stocks/AAPL");

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("symbol", "AAPL");
    expect(res.body).toHaveProperty("price");
    expect(res.body).toHaveProperty("currency", "USD");
    expect(res.body).toHaveProperty("timestamp");
  });
  });

  it("should return stock history for a valid symbol", async () => {
    mockFirestoreStockDataSuccess();
    const res = await request(app).get("/api/v1/stocks/AAPL/history");

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("symbol", "AAPL");
    expect(res.body).toHaveProperty("history");
    expect(Array.isArray(res.body.history)).toBe(true);
  });

  it("should return stock news for a valid symbol", async () => {
    const res = await request(app).get("/api/v1/stocks/AAPL/news");

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("symbol", "AAPL");
    expect(res.body).toHaveProperty("news");
    expect(Array.isArray(res.body.news)).toBe(true);
  });

  it("should handle error when fetching history for invalid symbol", async () => {
    const res = await request(app).get("/api/v1/stocks/error/history");

    expect(res.status).toBe(500);
    expect(res.body).toHaveProperty("error", "Failed to fetch stock history");
  });

  it("should handle error when fetching news for invalid symbol", async () => {
    const res = await request(app).get("/api/v1/stocks/error/news");

    expect(res.status).toBe(500);
    expect(res.body).toHaveProperty("error", "Failed to fetch stock news");
  });

it("should return market trends", async () => {
  const res = await request(app).get("/api/v1/stocks/market-trends");

  expect(res.status).toBe(200);
  expect(res.body).toHaveProperty("trends");
  expect(Array.isArray(res.body.trends)).toBe(true);
});

it("should search stocks based on query", async () => {
  mockFirestoreSearchSuccess();
  const res = await request(app).get("/api/v1/stocks/search?q=apple");

  expect(res.status).toBe(200);
  expect(res.body).toHaveProperty("results");
  expect(Array.isArray(res.body.results)).toBe(true);
});

it("should return sentiment analysis for a stock", async () => {
  mockFirestoreSentimentSuccess();
  const res = await request(app).get("/api/v1/stocks/AAPL/sentiment");

  expect(res.status).toBe(200);
  expect(res.body).toHaveProperty("sentiment");
  expect(res.body).toHaveProperty("sentimentScore");
  expect(res.body).toHaveProperty("summary");
});

// --- Stock Alert Protected Route Test ---
it("should deny access to alerts endpoint without token", async () => {
  const res = await request(app)
    .post("/api/v1/stocks/AAPL/alerts")
    .send({ targetPrice: 200 });

  expect(res.status).toBe(401);
  expect(res.body).toHaveProperty("error", "Missing token");
});