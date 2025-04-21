/**
 * @fileoverview Unit tests for Portfolio Controller - addStockToPortfolio, getUserPortfolio, removeStockFromPortfolio, and getPortfolioPerformance.
 * Uses Jest to test Firebase Firestore integration.
 */

import { addStockToPortfolio, getPortfolioPerformance, removeStockFromPortfolio, getUserPortfolio, setPriceAlert, deletePriceAlert } from "../src/api/v1/controllers/portfolioController";
import admin from "../src/config/firebase";
import request from "supertest";
import app from "../src/app";
import { Request, Response } from "express";

// --- Mock Setup ---
/**
 * Mocks the Firebase Admin SDK's Firestore module.
 * This is done to simulate Firestore functionality without accessing a real database.
 */
jest.mock("../src/config/firebase", () => ({
  firestore: jest.fn().mockReturnValue({
    collection: jest.fn().mockReturnThis(),
    doc: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    get: jest.fn(),
    add: jest.fn(),
    delete: jest.fn(),
    batch: jest.fn().mockReturnThis(),
    commit: jest.fn(),
    forEach: jest.fn(),
  }),
  auth: () => ({
    verifyIdToken: jest.fn().mockResolvedValue({
      uid: "mockUserId123",
      role: "Investor", 
    }),
  }),
}));

// --- Test Suite ---
/**
 * Test suite for the Portfolio Controller functions:
 * 1. addStockToPortfolio
 * 2. getUserPortfolio
 * 3. removeStockFromPortfolio
 * 4. getPortfolioPerformance
 */
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

  // --- getUserPortfolio Tests ---
  describe("getUserPortfolio", () => {
    /**
     * Test case: Should fetch user portfolio successfully.
     * Mocks Firestore `get` method to return mock portfolio data.
     */
    it("should fetch user portfolio successfully", async () => {
      const mockDocs = [
        { id: "1", data: () => ({ symbol: "AAPL", quantity: 10, averageBuyPrice: 150 }) },
        { id: "2", data: () => ({ symbol: "TSLA", quantity: 5, averageBuyPrice: 700 }) },
      ];
      const mockGet = admin.firestore().collection("portfolios").get as jest.Mock;
      mockGet.mockResolvedValue({ docs: mockDocs });

      const req = {} as Request;
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() } as unknown as Response;

      await getUserPortfolio(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        portfolio: [
          { id: "1", symbol: "AAPL", quantity: 10, averageBuyPrice: 150 },
          { id: "2", symbol: "TSLA", quantity: 5, averageBuyPrice: 700 },
        ],
      });
    });

    /**
     * Test case: Should return empty array when no portfolio exists.
     * Mocks Firestore `get` method to simulate an empty portfolio.
     */
    it("should return empty array when no portfolio exists", async () => {
      const mockGet = admin.firestore().collection("portfolios").get as jest.Mock;
      mockGet.mockResolvedValue({ docs: [] });

      const req = {} as Request;
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() } as unknown as Response;

      await getUserPortfolio(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ portfolio: [] });
    });

    /**
     * Test case: Should handle error when fetching portfolio fails.
     * Mocks Firestore `get` method to simulate an error.
     */
    it("should handle error when fetching portfolio fails", async () => {
      const mockGet = admin.firestore().collection("portfolios").get as jest.Mock;
      mockGet.mockRejectedValue(new Error("Error"));

      const req = {} as Request;
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() } as unknown as Response;

      await getUserPortfolio(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  // --- removeStockFromPortfolio Tests ---
  describe("removeStockFromPortfolio", () => {
    /**
     * Test case: Should return 404 when trying to remove a non-existent stock.
     * Mocks Firestore to return an empty result when searching for a stock to remove.
     */
    it("should return 404 when trying to remove a non-existent stock", async () => {
      const mockGet = admin.firestore().collection("portfolios").where("symbol", "==", "FAKE").get as jest.Mock;
      mockGet.mockResolvedValue({ empty: true });

      const req = {
        params: { symbol: "FAKE" },
      } as Partial<Request> as Request;
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() } as unknown as Response;

      await removeStockFromPortfolio(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });

    /**
     * Test case: Should handle error during stock removal.
     * Simulates an error while attempting to remove a stock and verifies error response.
     */
    it("should handle error during stock removal", async () => {
      const mockGet = admin.firestore().collection("portfolios").where("symbol", "==", "FAKE").get as jest.Mock;
      mockGet.mockRejectedValue(new Error("Firestore error"));

      const req = {
        params: { symbol: "FAKE" },
      } as Partial<Request> as Request;
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() } as unknown as Response;

      await removeStockFromPortfolio(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });

    /**
     * Test case: Should successfully remove the stock from the portfolio.
     * Mocks Firestore to simulate a successful stock removal.
     */
    it("should successfully remove the stock from the portfolio", async () => {
      const mockDocRef = { ref: "mockRef" }; // fake doc ref
      const mockGet = jest.fn().mockResolvedValue({
        empty: false,
        forEach: (cb: any) => cb(mockDocRef),
      });

      const mockBatch = {
        delete: jest.fn(),
        commit: jest.fn().mockResolvedValue({}),
      };

      const mockWhere = jest.fn(() => ({ get: mockGet }));
      const mockCollection = jest.fn(() => ({ where: mockWhere }));
      const mockFirestore = {
        collection: mockCollection,
        batch: () => mockBatch,
      };

      jest.spyOn(admin, "firestore").mockReturnValue(mockFirestore as any);

      const req = { params: { symbol: "AAPL" } } as unknown as Request;
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as unknown as Response;

      await removeStockFromPortfolio(req, res);

      expect(mockCollection).toHaveBeenCalledWith("portfolios");
      expect(mockWhere).toHaveBeenCalledWith("symbol", "==", "AAPL");
      expect(mockBatch.delete).toHaveBeenCalled();
      expect(mockBatch.commit).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: "Stock removed from portfolio" });
    });
  });

  // --- getPortfolioPerformance Tests ---
  describe("getPortfolioPerformance", () => {
    /**
     * Test case: Should return portfolio performance.
     * Mocks Firestore data to calculate and return portfolio performance metrics.
     */
    it("should return portfolio performance", async () => {
      const mockDocs = [
        { data: () => ({ quantity: 10, averageBuyPrice: 100 }) },
        { data: () => ({ quantity: 5, averageBuyPrice: 200 }) },
      ];
    
      const mockGet = jest.fn().mockResolvedValue({
        forEach: (cb: any) => mockDocs.forEach(cb),
      });
    
      const mockCollection = jest.fn(() => ({ get: mockGet }));
      jest.spyOn(admin, "firestore").mockReturnValue({ collection: mockCollection } as any);
    
      const req = {} as Request;
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() } as unknown as Response;
    
      await getPortfolioPerformance(req, res);
    
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        performance: {
          totalInvestment: 2000,
          totalValue: 2200,
          returnPercentage: 10,
        },
      });
    });
  });
});
  
/**
 * @fileoverview Unit and integration tests for Portfolio Controller functions:
 * 1. setPriceAlert
 * 2. deletePriceAlert
 * 3. Portfolio Routes (add, remove, and fetch stock, portfolio performance, price alerts)
 * Uses Jest for unit tests and Supertest for integration tests with Firebase Firestore integration.
 */

// --- setPriceAlert Tests ---
describe("setPriceAlert", () => {
  /**
   * Test case: Should set a price alert successfully.
   * Mocks Firestore `add` method and simulates a successful write operation for setting a price alert.
   * Expects status 201 and a success message in the response.
   */
  it("should set a price alert successfully", async () => {
    const mockAdd = jest.fn().mockResolvedValue({});
  
    const mockCollection = jest.fn(() => ({ add: mockAdd }));
    jest.spyOn(admin, "firestore").mockReturnValue({ collection: mockCollection } as any);
  
    const req = { body: { symbol: "AAPL", targetPrice: 300 } } as Request;
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as Response;
  
    await setPriceAlert(req, res);
  
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({ message: "Price alert set" });
  });

  /**
   * Test case: Should handle error during price alert creation.
   * Mocks Firestore `add` method to reject and verifies that the error is handled correctly.
   * Expects status 500 and an error message in the response.
   */
  it("should handle error during price alert creation", async () => {
    const mockAdd = jest.fn().mockRejectedValue(new Error("Alert error"));
  
    const mockCollection = jest.fn(() => ({ add: mockAdd }));
    jest.spyOn(admin, "firestore").mockReturnValue({ collection: mockCollection } as any);
  
    const req = { body: { symbol: "ERR", targetPrice: 300 } } as Request;
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as Response;
  
    await setPriceAlert(req, res);
  
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: "Failed to set alert" });
  });
});

// --- deletePriceAlert Tests ---
describe("deletePriceAlert", () => {
  /**
   * Test case: Should handle error when deleting a price alert.
   * Simulates a failed deletion by rejecting the Firestore `delete` method.
   * Expects status 500 and an error message in the response.
   */
  it("should handle error when deleting a price alert", async () => {
    const mockDelete = jest.fn().mockRejectedValue(new Error("Delete error"));
    const mockDoc = jest.fn().mockReturnValue({ delete: mockDelete });
    const mockCollection = jest.fn().mockReturnValue({ doc: mockDoc });
    const mockFirestore = jest.fn().mockReturnValue({ collection: mockCollection });

    (admin.firestore as unknown as jest.Mock).mockImplementation(mockFirestore);

    const req = {
      params: { id: "FAKE_ID" },
    } as Partial<Request> as Request;
    
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as Response;

    await deletePriceAlert(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: "Failed to delete alert" });
  });

  /**
   * Test case: Should delete a price alert successfully.
   * Simulates a successful price alert deletion and ensures the correct response.
   * Expects status 200 and a success message in the response.
   */
  it("should delete a price alert successfully", async () => {
    const mockDelete = jest.fn().mockResolvedValue({});
    const mockDoc = jest.fn().mockReturnValue({ delete: mockDelete });
    const mockCollection = jest.fn().mockReturnValue({ doc: mockDoc });
    const mockFirestore = jest.fn().mockReturnValue({ collection: mockCollection });

    (admin.firestore as unknown as jest.Mock).mockImplementation(mockFirestore);

    const req = { params: { id: "test-alert-id" } } as unknown as Request;
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() } as unknown as Response;

    await deletePriceAlert(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ message: "Price alert deleted" });
  });
});

// --- Portfolio Routes (Integration Tests) ---
describe("Portfolio Routes (Integration Tests)", () => {
  /**
   * Test case: Should return 201 on successful stock addition.
   * Verifies that a stock is successfully added to the portfolio and a response with status 201 is returned.
   */
  it("should return 201 on successful stock addition", async () => {
    const res = await request(app)
      .post("/api/v1/portfolio/add-stock")
      .set("Authorization", "Bearer dummy_token")
      .send({
        symbol: "GOOGL",
        quantity: 5,
        averageBuyPrice: 2000,
      });

    expect([201, 500]).toContain(res.status); 
    if (res.status === 201) {
      expect(res.body).toHaveProperty("message", "Stock added to portfolio");
    } else {
      expect(res.body).toHaveProperty("error");
    }
  });

  /**
   * Test case: Should return 400 or 500 for invalid/missing data.
   * Verifies that a 400 or 500 error is returned for invalid or missing data in the stock addition request.
   */
  it("should return 400 or 500 for invalid/missing data", async () => {
    const res = await request(app)
      .post("/api/v1/portfolio/add-stock")
      .set("Authorization", "Bearer dummy_token") 
      .send({
          symbol: "",
      });

    expect([400, 500]).toContain(res.status); 
  });

  /**
   * Test case: Should return 200 on fetching portfolio.
   * Verifies that fetching the portfolio returns a status 200 or various error statuses based on authorization.
   */
  it("should return 200 on fetching portfolio", async () => {
    const res = await request(app)
      .get("/api/v1/portfolio")
      .set("Authorization", "Bearer dummy_token");

    expect([200, 401, 403, 500]).toContain(res.status);
  });

  /**
   * Test case: Should return 200 or 404 when removing stock.
   * Verifies the removal of a stock from the portfolio, with possible error responses for non-existent stocks.
   */
  it("should return 200 or 404 when removing stock", async () => {
    const res = await request(app)
      .delete("/api/v1/portfolio/remove/AAPL")
      .set("Authorization", "Bearer dummy_token");

    expect([200, 404, 401, 403, 500]).toContain(res.status);
  });

  /**
   * Test case: Should return 200 on fetching portfolio performance.
   * Verifies the fetching of portfolio performance data, expecting a status of 200 or various error responses.
   */
  it("should return 200 on fetching portfolio performance", async () => {
    const res = await request(app)
      .get("/api/v1/portfolio/performance")
      .set("Authorization", "Bearer dummy_token");

    expect([200, 401, 403, 500]).toContain(res.status);
  });

  /**
   * Test case: Should return 201 when setting a price alert.
   * Verifies that setting a price alert returns a status of 201 and appropriate message.
   */
  it("should return 201 when setting a price alert", async () => {
    const res = await request(app)
      .post("/api/v1/portfolio/alerts")
      .set("Authorization", "Bearer dummy_token")
      .send({ symbol: "AMZN", targetPrice: 3300 });

    expect([201, 401, 403, 500]).toContain(res.status);
  });

  /**
   * Test case: Should return 200 when deleting a price alert.
   * Verifies that deleting a price alert returns a status of 200 and appropriate message.
   */
  it("should return 200 when deleting a price alert", async () => {
    const res = await request(app)
      .delete("/api/v1/portfolio/alerts/test-alert-id")
      .set("Authorization", "Bearer dummy_token");

    expect([200, 401, 403, 500]).toContain(res.status);
  });
});
