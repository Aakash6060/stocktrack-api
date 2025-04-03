import { addStockToPortfolio } from "../src/api/v1/controllers/portfolioController";
import admin from "../src/config/firebase";
import { Request, Response } from "express";

// Mock Firebase Admin SDK
jest.mock("../src/config/firebase", () => ({
  firestore: jest.fn().mockReturnValue({
    collection: jest.fn().mockReturnValue({
      add: jest.fn(),
    }),
  }),
}));

describe("Portfolio Controller", () => {
  describe("addStockToPortfolio", () => {
    it("should add a stock to the portfolio successfully", async () => {
      const req = {
        body: {
          symbol: "AAPL",
          quantity: 10,
          averageBuyPrice: 150,
        },
      } as Request;

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as unknown as Response;

      // Fix: Provide the collection path argument here
      const mockAdd = admin.firestore().collection("portfolios").add as jest.Mock;
      mockAdd.mockResolvedValue({});

      await addStockToPortfolio(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ message: "Stock added to portfolio" });
    });

    it("should handle error when adding stock to portfolio fails", async () => {
      const req = {
        body: {
          symbol: "AAPL",
          quantity: 10,
          averageBuyPrice: 150,
        },
      } as Request;

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as unknown as Response;

      // Fix: Provide the collection path argument here
      const mockAdd = admin.firestore().collection("portfolios").add as jest.Mock;
      mockAdd.mockRejectedValue(new Error("Failed to add stock"));

      await addStockToPortfolio(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: "Failed to add stock" });
    });
  });
});
