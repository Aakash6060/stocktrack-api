import { getStockData, getStockHistory, getStockNews } from "../src/api/v1/controllers/stockController";
import { Request, Response } from "express";

// Mock implementation of Request
const createRequest = (params: { symbol: string }): Request => ({
  params,
  body: {},
  query: {},
  headers: {},
} as unknown as Request);

describe("Stock Controller", () => {
  beforeEach(() => {
    // Mock Math.random globally before each test for a predictable value
    jest.spyOn(Math, "random").mockImplementation(() => 0.5); // Mock random to return a predictable value
  });

  afterEach(() => {
    // Restore Math.random after each test to its original functionality
    jest.restoreAllMocks();
  });

  describe("getStockData", () => {
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

  describe("getStockHistory", () => {
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

    it("should handle error when fetching stock history fails", async () => {
      const req = createRequest({ symbol: "error" });  // Trigger error scenario
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as unknown as Response;

      await getStockHistory(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: "Failed to fetch stock history" });
    });
  });

  describe("getStockNews", () => {
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

    it("should handle error when fetching stock news fails", async () => {
      const req = createRequest({ symbol: "error" });  // Trigger error scenario
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
