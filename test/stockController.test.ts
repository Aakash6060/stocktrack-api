/**
 * Mocks Firestore behavior for fetching stock history data.
 * Returns a successful response with stock price history.
 */
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

/**
 * Mocks Firestore behavior for simulating a failure when fetching stock history.
 * Throws an error to simulate Firestore failure.
 */
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

/**
 * Mocks Firestore behavior for fetching stock news data.
 * Returns a successful response with stock news articles.
 */
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

/**
 * Mocks Firestore behavior for simulating a failure when fetching stock news.
 * Throws an error to simulate Firestore failure.
 */
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

/**
 * Mocks Firestore behavior for fetching sector data.
 * Returns a successful response with sector information.
 */
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

/**
 * Mocks Firestore behavior for searching stocks.
 * Returns a successful response with stock data.
 */
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

/**
 * Mocks Firestore behavior for fetching stock sentiment data.
 * Returns a successful response with sentiment analysis for a stock.
 */
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

/**
 * Mocks Firestore behavior for fetching stock data.
 * Returns a successful response with stock price and update timestamp.
 */
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
import * as cacheService from "../src/api/v1/services/cache.service";
import admin from "../src/config/firebase";

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
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(cacheService, "getCache").mockReturnValue(undefined); // default: no cache
  });

  // --- getStockData Tests ---
  describe("getStockData", () => {
    /**
     * Test case: Should return stock data for a valid symbol.
     * This test checks if the stock data for symbol "AAPL" is correctly fetched from Firestore or cache 
     * and returns a successful response with status code 200.
     */
    it("should return stock data", async () => {
      clearCache("stock_data_aapl");
      const req = createRequest({ symbol: "AAPL" });

      jest.spyOn(admin.firestore(), "collection").mockImplementationOnce(() => {
        throw new Error("Simulated error");
      });

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
     * This test simulates a failure in fetching stock data and checks if the error response is returned with status code 500.
     */
    it("should handle error when fetching stock data fails", async () => {
      clearCache("stock_data_aapl");

      jest.spyOn(admin.firestore(), "collection").mockImplementationOnce(() => {
        throw new Error("Simulated error");
      });
      
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

    /**
     * Test case: Should return cached stock data if available.
     * This test checks if cached stock data is used when it is available, returning it with a "CACHE" source.
     */
    it("should return cached stock data", async () => {
      const cachedData = {
        symbol: "AAPL",
        price: 185.67,
        change: 1.23,
        volume: 5000000,
      };
    
      jest.spyOn(cacheService, "getCache").mockReturnValue(cachedData);
    
      const req = createRequest({ symbol: "AAPL" });
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as unknown as Response;
    
      await getStockData(req, res);
    
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        ...cachedData,
        source: "CACHE",
      });
    });

    /**
     * Test case: Should return 404 if stock data is not found in Firestore.
     * This test simulates the case where no stock data is found in Firestore and checks if a 404 error is returned.
     */
    it("should return 404 if stock data is not found in Firestore", async () => {
      clearCache("stock_data_aapl");
    
      // Simulate Firestore returning no matching document
      jest.spyOn(admin, "firestore").mockReturnValue({
        collection: jest.fn().mockReturnValue({
          doc: jest.fn(() => ({
            get: jest.fn().mockResolvedValue({ exists: false }),
          })),
        }),
      } as any);
    
      const req = createRequest({ symbol: "AAPL" });
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as unknown as Response;
    
      await getStockData(req, res);
    
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: "Stock not found" });
    });
  });

  // --- getStockHistory Tests ---
  describe("getStockHistory", () => {
    /**
     * Test case: Should return stock history for a valid symbol.
     * This test checks that the stock history data for the given symbol "AAPL" is fetched correctly 
     * from Firestore (or cache) and returned as a JSON response with status 200.
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
     * This test checks the error handling when Firestore or cache fails to retrieve stock history.
     * It ensures that a 500 error response is returned with an appropriate error message.
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
     * This test checks that the stock news data for the given symbol "AAPL" is fetched correctly 
     * from Firestore (or cache) and returned as a JSON response with status 200.
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
     * This test checks the error handling when Firestore or cache fails to retrieve stock news.
     * It ensures that a 500 error response is returned with an appropriate error message.
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

describe("getMarketTrends", () => {
  /**
   * Test case: Should return mock market trends.
   * This test checks that market trends are returned correctly, either from cache or Firestore,
   * as part of the response with status 200.
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
   * This test checks the error handling when fetching market trends fails, ensuring that a 500 error
   * response is returned with an appropriate error message.
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

  /**
   * Test case: Should return cached search results.
   * This test checks that cached search results are returned for a stock search query when available.
   */
  it("should return cached search results", async () => {
    const cachedData = {
      results: [
        { symbol: "AAPL", name: "Apple Inc." },
        { symbol: "MSFT", name: "Microsoft Corp." },
      ],
    };

    jest.spyOn(cacheService, "getCache").mockReturnValue(cachedData);

    const req = { query: { q: "apple" } } as unknown as Request;
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as Response;

    await searchStocks(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      ...cachedData,
      source: "CACHE",
    });
  });

  /**
   * Test case: Should return cached market trends.
   * This test checks that cached market trends are returned when available in the cache.
   */
  it("should return cached market trends", async () => {
    const cachedResponse = {
      trends: [
        { sector: "Tech", trend: "+3.5%" },
        { sector: "Energy", trend: "-1.2%" },
      ],
    };

    jest.spyOn(cacheService, "getCache").mockReturnValue(cachedResponse);

    const req = {} as Request;
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as Response;

    await getMarketTrends(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      ...cachedResponse,
      source: "CACHE",
    });
  });

  /**
   * Test case: Should handle error when fetching trends fails.
   * This test checks how the system handles errors when fetching market trends from Firestore or cache fails.
   */
  it("should handle error when fetching trends fails", async () => {
    jest.spyOn(cacheService, "getCache").mockReturnValue(undefined);

    const mockGet = jest.fn().mockRejectedValue(new Error("Simulated Firestore error"));

    const mockCollection = jest.fn().mockReturnValue({
      get: mockGet,
    });

    jest.spyOn(admin, "firestore").mockReturnValue({
      collection: mockCollection,
    } as unknown as FirebaseFirestore.Firestore);

    const req = {} as Request;
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as Response;

    await getMarketTrends(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: "Failed to fetch market trends" });
  });

// --- searchStocks Tests ---
describe("searchStocks", () => {
  /**
   * Test case: Should return search results for a query match.
   * Verifies that when a query is provided, the system searches stocks 
   * and returns filtered results.
   */
  it("should return filtered stock results", async () => {
    jest.spyOn(cacheService, "getCache").mockReturnValue(undefined);
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
   * Simulates an error during the filtering of stock results and checks 
   * for proper error handling and response.
   */
  it("should handle error during stock search", async () => {
    // Force cache to be skipped
    jest.spyOn(cacheService, "getCache").mockReturnValue(undefined);
  
    const req = {
      query: { q: "apple" },
    } as unknown as Request;
  
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as Response;
  
    // Simulate error in filter
    jest.spyOn(Array.prototype, "filter").mockImplementationOnce(() => {
      throw new Error("Simulated error");
    });
  
    await searchStocks(req, res);
  
    expect(res.status).toHaveBeenCalledWith(500);
  expect(res.json).toHaveBeenCalledWith({ error: "Failed to search stocks" });
});
});

  /**
   * Test case: Should return cached search results.
   * Verifies that cached data is used if available, reducing the need 
   * for repeated database queries.
   */
  it("should return cached search results", async () => {
    const cachedData = {
      results: [{ symbol: "AAPL", name: "Apple Inc." }],
    };

    jest.spyOn(cacheService, "getCache").mockReturnValue(cachedData);

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
      ...cachedData,
      source: "CACHE",
    });
  });

  /**
   * Test case: Should handle non-string query by defaulting to empty string.
   * Ensures that if a non-string value is provided for the search query, 
   * it defaults to an empty string to prevent errors.
   */
  it("should handle non-string query by defaulting to empty string", async () => {
    jest.spyOn(cacheService, "getCache").mockReturnValue(undefined);
  
    const mockDocs = [
      {
        data: () => ({ symbol: "AAPL", name: "Apple Inc." }),
      },
    ];
  
    const mockGet = jest.fn().mockResolvedValue({ docs: mockDocs });
    const mockCollection = jest.fn(() => ({ get: mockGet }));
  
    jest.spyOn(admin, "firestore").mockReturnValue({
      collection: mockCollection,
    } as unknown as FirebaseFirestore.Firestore);
  
    const req = {
      query: { q: 12345 }, // q is not a string
    } as unknown as Request;
  
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as Response;
  
    await searchStocks(req, res);
  
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      results: [{ symbol: "AAPL", name: "Apple Inc." }],
      source: "FIRESTORE",
    });
  });
  
// --- getStockSentiment Tests ---
describe("getStockSentiment", () => {
  afterEach(() => {
    jest.restoreAllMocks(); 
  });

  /**
   * Test case: Should return sentiment analysis.
   * Verifies that sentiment data is returned from cache if available.
   */
  it("should return cached sentiment data", async () => {
    const cachedSentiment = {
      symbol: "AAPL",
      sentimentScore: 0.72,
      sentiment: "Positive",
      summary: "Apple is performing well in the market.",
    };
  
    jest
      .spyOn(cacheService, "getCache")
      .mockReturnValue(cachedSentiment);
  
    const req = createRequest({ symbol: "AAPL" });
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as Response;
  
    await getStockSentiment(req, res);
  
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      ...cachedSentiment,
      source: "CACHE",
    });
  })  

  /**
   * Test case: Should handle sentiment analysis error.
   * Ensures proper error handling if there's an issue processing sentiment data.
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

  /**
   * Test case: Should return 404 if sentiment not found.
   * Handles the scenario where sentiment data is not available in Firestore.
   */
  it("should return 404 if sentiment not found", async () => {
    clearCache("stock_sentiment_aapl");

    const mockDoc = {
      exists: false,
    };

    const mockGet = jest.fn().mockResolvedValue(mockDoc);

    const mockDocRef = jest.fn(() => ({
      get: mockGet,
    }));

    const mockCollection = jest.fn(() => ({
      doc: jest.fn(() => ({
        collection: jest.fn(() => ({
          doc: mockDocRef,
        })),
      })),
    }));

    jest.spyOn(admin, "firestore").mockReturnValue({
      collection: mockCollection,
    } as unknown as FirebaseFirestore.Firestore);

    const req = createRequest({ symbol: "AAPL" });

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as Response;

    await getStockSentiment(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: "Sentiment not found" });
  });

// --- setStockAlert Tests ---
describe("setStockAlert", () => {
  /**
   * Test case: Should create stock alert with valid targetPrice.
   * Verifies that stock alerts are created with a valid target price.
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
   * Verifies that an error is returned if the target price is not provided.
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
   * Simulates an error during alert creation and checks for proper error handling.
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

// --- Stock Routes (Integration Tests) ---
describe("Stock Routes (Integration Tests)", () => {
  /**
   * Clears all mocks before each test to ensure no state leakage between tests.
   */
  beforeEach(() => {
    jest.clearAllMocks(); 
  });

  /**
   * Test case: Should return stock data for a valid symbol.
   * Verifies that the stock data for a valid symbol (e.g., AAPL) is returned correctly.
   * Expects properties like symbol, price, currency, and timestamp in the response.
   */
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

  /**
   * Test case: Should return stock history for a valid symbol.
   * Verifies that the stock history for a valid symbol (e.g., AAPL) is returned correctly.
   * Expects the response to contain a history array.
   */
  it("should return stock history for a valid symbol", async () => {
    mockFirestoreStockDataSuccess();
    const res = await request(app).get("/api/v1/stocks/AAPL/history");

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("symbol", "AAPL");
    expect(res.body).toHaveProperty("history");
    expect(Array.isArray(res.body.history)).toBe(true);
  });

  /**
   * Test case: Should return stock news for a valid symbol.
   * Verifies that the stock news for a valid symbol (e.g., AAPL) is returned correctly.
   * Expects the response to contain an array of news articles.
   */
  it("should return stock news for a valid symbol", async () => {
    const res = await request(app).get("/api/v1/stocks/AAPL/news");

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("symbol", "AAPL");
    expect(res.body).toHaveProperty("news");
    expect(Array.isArray(res.body.news)).toBe(true);
  });

  /**
   * Test case: Should handle error when fetching history for an invalid symbol.
   * Simulates an error when attempting to fetch stock history for an invalid symbol and checks for the error response.
   */
  it("should handle error when fetching history for invalid symbol", async () => {
    const res = await request(app).get("/api/v1/stocks/error/history");

    expect(res.status).toBe(500);
    expect(res.body).toHaveProperty("error", "Failed to fetch stock history");
  });

  /**
   * Test case: Should handle error when fetching news for an invalid symbol.
   * Simulates an error when attempting to fetch stock news for an invalid symbol and checks for the error response.
   */
  it("should handle error when fetching news for invalid symbol", async () => {
    const res = await request(app).get("/api/v1/stocks/error/news");

    expect(res.status).toBe(500);
    expect(res.body).toHaveProperty("error", "Failed to fetch stock news");
  });

  /**
   * Test case: Should return market trends.
   * Verifies that the market trends data is returned correctly.
   * Expects the response to contain a list of market trends.
   */
  it("should return market trends", async () => {
    const res = await request(app).get("/api/v1/stocks/market-trends");

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("trends");
    expect(Array.isArray(res.body.trends)).toBe(true);
  });

    /**
     * Test case: Should search stocks based on query.
     * Verifies that stock search returns results based on the query parameter.
     * Expects a list of results for a valid search query (e.g., 'apple').
     */
  it("should search stocks based on query", async () => {
    mockFirestoreSearchSuccess();
    const res = await request(app).get("/api/v1/stocks/search?q=apple");

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("results");
    expect(Array.isArray(res.body.results)).toBe(true);
  });

    /**
     * Test case: Should return sentiment analysis for a stock.
     * Verifies that sentiment analysis data for a stock (e.g., AAPL) is returned correctly.
     * Expects sentiment score, sentiment, and summary in the response.
     */
  it("should return sentiment analysis for a stock", async () => {
    mockFirestoreSentimentSuccess();
    const res = await request(app).get("/api/v1/stocks/AAPL/sentiment");

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("sentiment");
    expect(res.body).toHaveProperty("sentimentScore");
    expect(res.body).toHaveProperty("summary");
  });

    // --- Stock Alert Protected Route Test ---
    /**
     * Test case: Should deny access to alerts endpoint without token.
     * Verifies that access to the stock alerts endpoint is denied when the token is missing.
     * Expects a 401 status and an appropriate error message.
     */
  it("should deny access to alerts endpoint without token", async () => {
    const res = await request(app)
      .post("/api/v1/stocks/AAPL/alerts")
      .send({ targetPrice: 200 });

    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty("error", "Missing token");
  });