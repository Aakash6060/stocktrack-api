/**
 * @fileoverview Unit tests for Stock Controller - getStockData, getStockHistory, getStockNews.
 * Uses Jest to test mocked implementations of stock-related data retrieval.
 */

import { getStockData, getStockHistory, getStockNews } from "../src/api/v1/controllers/stockController";
import { Request, Response } from "express";

// --- Helper Function ---

/**
 * Creates a mock Request object with a given stock symbol.
 * @param params - Object containing stock symbol.
 * @returns A mocked Express Request object.
 */
const createRequest = (params: { symbol: string }): Request => ({
  params,
  body: {},
  query: {},
  headers: {},
} as unknown as Request);

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
