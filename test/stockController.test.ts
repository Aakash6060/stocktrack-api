import { getStockData } from "../src/api/v1/controllers/stockController";
import { Request, Response } from "express";

// Mock implementation of Request
const createRequest = (params: { symbol: string }): Request => ({
  params,
  body: {},
  query: {},
  headers: {},
  // Add other properties if needed
} as unknown as Request);

describe("Stock Controller", () => {
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

      // Mocking Math.random to throw an error
      jest.spyOn(Math, "random").mockImplementationOnce(() => {
        throw new Error("Mocked error");
      });

      await getStockData(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: "Failed to fetch stock data" });
    });
  });
});
