/**
 * @fileoverview Unit tests for Stock Controller - getStockData, getStockHistory, getStockNews.
 * Uses Jest to test mocked implementations of stock-related data retrieval.
 */

import { getStockData, getStockHistory, getStockNews } from "../src/api/v1/controllers/stockController";
import { Request, Response } from "express";
import request from "supertest";
import app from "../src/app";

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

  /**
   * Sets up predictable Math.random before each test.
   */
  beforeEach(() => {
    jest.spyOn(Math, "random").mockImplementation(() => 0.5);
  });

  /**
   * Restores original Math.random after each test.
   */
  afterEach(() => {
    jest.restoreAllMocks();
  });

  // --- getStockData Tests ---
  describe("getStockData", () => {
    /**
     * Test case: Should return stock data for a valid symbol.
     */
    it("should return stock data", async () => {
      const req = createRequest({ symbol: "AAPL" });

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as unknown as Response;

      await getStockData(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        symbol: "AAPL",
        price: expect.any(Number),
        currency: "USD",
        timestamp: expect.any(String),
      });
    });

    /**
     * Test case: Should handle error when stock data retrieval fails.
     */
    it("should handle error when fetching stock data fails", async () => {
      const req = createRequest({ symbol: "AAPL" });

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as unknown as Response;

      jest.spyOn(Math, "random").mockImplementationOnce(() => {
        throw new Error("Mocked error");
      });

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
      });
    });

    /**
     * Test case: Should handle error when stock history retrieval fails.
     */
    it("should handle error when fetching stock history fails", async () => {
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
      });
    });

    /**
     * Test case: Should handle error when stock news retrieval fails.
     */
    it("should handle error when fetching stock news fails", async () => {
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

describe("Stock Routes (Integration Tests)", () => {
  it("should return stock data for a valid symbol", async () => {
    const res = await request(app).get("/api/v1/stocks/AAPL");

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("symbol", "AAPL");
    expect(res.body).toHaveProperty("price");
    expect(res.body).toHaveProperty("currency", "USD");
    expect(res.body).toHaveProperty("timestamp");
  });

  it("should return stock history for a valid symbol", async () => {
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
});