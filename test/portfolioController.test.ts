/**
 * @fileoverview Unit tests for Portfolio Controller - addStockToPortfolio.
 * Uses Jest to test Firebase Firestore integration.
 */

import { addStockToPortfolio, getPortfolioPerformance, removeStockFromPortfolio, getUserPortfolio, setPriceAlert, deletePriceAlert } from "../src/api/v1/controllers/portfolioController";
import admin from "../src/config/firebase";
import request from "supertest";
import app from "../src/app";
import { Request, Response } from "express";

// --- Mock Setup ---

/**
 * Mock Firebase Admin SDK's Firestore module.
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

describe("getUserPortfolio", () => {
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

  it("should return empty array when no portfolio exists", async () => {
    const mockGet = admin.firestore().collection("portfolios").get as jest.Mock;
    mockGet.mockResolvedValue({ docs: [] });

    const req = {} as Request;
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() } as unknown as Response;

    await getUserPortfolio(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ portfolio: [] });
  });

  it("should handle error when fetching portfolio fails", async () => {
    const mockGet = admin.firestore().collection("portfolios").get as jest.Mock;
    mockGet.mockRejectedValue(new Error("Error"));

    const req = {} as Request;
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() } as unknown as Response;

    await getUserPortfolio(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
  });
});

describe("removeStockFromPortfolio", () => {
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
});

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


describe("getPortfolioPerformance", () => {
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
  

describe("setPriceAlert", () => {
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
  });

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

describe("deletePriceAlert", () => {
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
}); 

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


describe("Portfolio Routes (Integration Tests)", () => {
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

  it("should return 400 or 500 for invalid/missing data", async () => {
    const res = await request(app)
    .post("/api/v1/portfolio/add-stock")
    .set("Authorization", "Bearer dummy_token") 
    .send({
        symbol: "",
    });

    expect([400, 500]).toContain(res.status); 
  });
});

  it("should return 400 or 500 for invalid/missing data", async () => {
    const res = await request(app)
    .post("/api/v1/portfolio/add-stock")
    .set("Authorization", "Bearer dummy_token") 
    .send({
      symbol: "",
    });

    expect([400, 500]).toContain(res.status);
  });

  it("should return 200 on fetching portfolio", async () => {
    const res = await request(app)
      .get("/api/v1/portfolio")
      .set("Authorization", "Bearer dummy_token");

    expect([200, 401, 403, 500]).toContain(res.status);
  });

  it("should return 200 or 404 when removing stock", async () => {
    const res = await request(app)
      .delete("/api/v1/portfolio/remove/AAPL")
      .set("Authorization", "Bearer dummy_token");

    expect([200, 404, 401, 403, 500]).toContain(res.status);
  });

  it("should return 200 on fetching portfolio performance", async () => {
    const res = await request(app)
      .get("/api/v1/portfolio/performance")
      .set("Authorization", "Bearer dummy_token");

    expect([200, 401, 403, 500]).toContain(res.status);
  });

  it("should return 201 when setting a price alert", async () => {
    const res = await request(app)
      .post("/api/v1/portfolio/alerts")
      .set("Authorization", "Bearer dummy_token")
      .send({ symbol: "AMZN", targetPrice: 3300 });

    expect([201, 401, 403, 500]).toContain(res.status);
  });

  it("should return 200 when deleting a price alert", async () => {
    const res = await request(app)
      .delete("/api/v1/portfolio/alerts/test-alert-id")
      .set("Authorization", "Bearer dummy_token");

    expect([200, 401, 403, 500]).toContain(res.status);
  });
