/**
 * @fileoverview Unit tests for Portfolio Controller - addStockToPortfolio.
 * Uses Jest to test Firebase Firestore integration.
 */

import { addStockToPortfolio } from "../src/api/v1/controllers/portfolioController";
import admin from "../src/config/firebase";
import { Request, Response } from "express";

// --- Mock Setup ---

/**
 * Mock Firebase Admin SDK's Firestore module.
 */
jest.mock("../src/config/firebase", () => ({
  firestore: jest.fn().mockReturnValue({
    collection: jest.fn().mockReturnValue({
      add: jest.fn(),
    }),
  }),
}));

// --- Test Suite ---

describe("Portfolio Controller", () => {
  // --- addStockToPortfolio Tests ---
  describe("addStockToPortfolio", () => {
    /**
     * Test case: Should add a stock to the portfolio successfully.
     * Mocks Firestore `add` method and simulates a successful write operation.
     */
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

      // Simulate successful Firestore write
      const mockAdd = admin.firestore().collection("portfolios").add as jest.Mock;
      mockAdd.mockResolvedValue({});

      await addStockToPortfolio(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ message: "Stock added to portfolio" });
    });

    /**
     * Test case: Should handle error when adding stock to portfolio fails.
     * Mocks Firestore `add` method to reject and verifies error response.
     */
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

      // Simulate Firestore failure
      const mockAdd = admin.firestore().collection("portfolios").add as jest.Mock;
      mockAdd.mockRejectedValue(new Error("Failed to add stock"));

      await addStockToPortfolio(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: "Failed to add stock" });
    });
  });
});
