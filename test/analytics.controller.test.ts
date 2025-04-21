/**
 * @fileoverview Unit tests for Analytics Controller.
 * Uses Jest to test Firebase Firestore integration.
 */

import { getMarketPerformance, getSectorInsights, getTopMovers, getUserTrends, setNotification, deleteNotification } from "../src/api/v1/controllers/analytics.controller";
import app from "../src/app";
import request from "supertest";
import admin from "../src/config/firebase";
import { Request, Response } from "express";
import { clearCache } from "../src/api/v1/services/cache.service";
import * as cacheService from "../src/api/v1/services/cache.service";

let mockUserRole: string = "Admin";

// --- Firebase Mock Setup ---
jest.mock("../src/config/firebase", () => {
    const getMock = jest.fn();
    const addMock = jest.fn();
    const deleteMock = jest.fn();
  
    const docMock = jest.fn(() => ({
      get: getMock,
      delete: deleteMock,
    }));
  
    const collectionMock = jest.fn(() => ({
      get: getMock,
      doc: docMock,
      add: addMock,
    }));
  
    const firestoreInstance = {
      collection: collectionMock,
    };
  
    return {
      firestore: jest.fn(() => firestoreInstance),
      auth: () => ({
        verifyIdToken: jest.fn().mockResolvedValue({
          uid: "mockUserId123",
          role: mockUserRole,
        }),
      }),
      default: {
        firestore: Object.assign(() => firestoreInstance, {
          FieldValue: {
            serverTimestamp: jest.fn(() => "mocked-timestamp"),
          },
        }),
      },
    };
  });
  
  // --- Test Suites ---
  
  describe("Analytics Controller", () => {
    // getMarketPerformance
    describe("getMarketPerformance", () => {
      it("should return market performance data", async () => {
        const mockDocs = [{ data: () => ({ index: "S&P 500", value: 4200 }) }];
        const mockGet = admin.firestore().collection("marketPerformance").get as jest.Mock;
        mockGet.mockResolvedValue({ docs: mockDocs });
  
        const req = {} as Request;
        const res = { status: jest.fn().mockReturnThis(), json: jest.fn() } as unknown as Response;
  
        await getMarketPerformance(req, res);
  
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            data: [{ index: "S&P 500", value: 4200 }],
            source: "FIRESTORE",
          }));
      });
  
      it("should handle error on market performance fetch", async () => {
        clearCache("analytics_market");
        const mockGet = admin.firestore().collection("marketPerformance").get as jest.Mock;
        mockGet.mockRejectedValue(new Error("Firestore error"));
  
        const req = {} as Request;
        const res = { status: jest.fn().mockReturnThis(), json: jest.fn() } as unknown as Response;
  
        await getMarketPerformance(req, res);
  
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ error: "Failed to retrieve market performance" });
      });
    });
  
    // getSectorInsights
    describe("getSectorInsights", () => {
      it("should return sector insights data", async () => {
        const mockData = { sector: "Tech", performance: 12 };
        const mockGet = admin.firestore().collection("sectors").doc("Tech").get as jest.Mock;
        mockGet.mockResolvedValue({ exists: true, data: () => mockData });
  
        const req = { params: { sector: "Tech" } } as unknown as Request;
        const res = { status: jest.fn().mockReturnThis(), json: jest.fn() } as unknown as Response;
  
        await getSectorInsights(req, res);
  
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({ insights: mockData, source: "FIRESTORE",
        });
      });
  
      it("should return 404 if sector not found", async () => {
        jest.spyOn(cacheService, "getCache").mockReturnValue(undefined);

        const mockGet = admin.firestore().collection("sectors").doc("Unknown").get as jest.Mock;
        mockGet.mockResolvedValue({ exists: false });
  
        const req = { params: { sector: "Unknown" } } as unknown as Request;
        const res = { status: jest.fn().mockReturnThis(), json: jest.fn() } as unknown as Response;
  
        await getSectorInsights(req, res);
  
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ message: "Sector data not found" });
      });
  
      it("should handle error on sector fetch", async () => {
        clearCache("analytics_sector_Tech");
        const mockGet = admin.firestore().collection("sectors").doc("Tech").get as jest.Mock;
        mockGet.mockRejectedValue(new Error("Error"));
  
        const req = { params: { sector: "Tech" } } as unknown as Request;
        const res = { status: jest.fn().mockReturnThis(), json: jest.fn() } as unknown as Response;
  
        await getSectorInsights(req, res);
  
        expect(res.status).toHaveBeenCalledWith(500);
      });
    });
  
    // getTopMovers
    describe("getTopMovers", () => {
      it("should handle error when fetching top movers", async () => {
        const docMock = jest.fn()
          .mockImplementationOnce(() => ({
            get: jest.fn().mockRejectedValue(new Error("Firestore error")),
          }))
          .mockImplementationOnce(() => ({
            get: jest.fn(),
          }));
  
        const collectionMock = jest.fn(() => ({ doc: docMock }));
        jest.spyOn(admin, "firestore").mockReturnValue({ collection: collectionMock } as any);
  
        const req = {} as Request;
        const res = { status: jest.fn().mockReturnThis(), json: jest.fn() } as unknown as Response;
  
        await getTopMovers(req, res);
  
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ error: "Failed to fetch top movers" });
      });
    });
  
    // getUserTrends
    describe("getUserTrends", () => {
      it("should return user trend analytics", async () => {
        const mockDocs = [
          { data: () => ({ trend: "buy", count: 10 }) },
          { data: () => ({ trend: "sell", count: 5 }) },
        ];
        const getMock = jest.fn().mockResolvedValue({ docs: mockDocs });
  
        jest.spyOn(admin, "firestore").mockReturnValue({
          collection: jest.fn().mockReturnValue({ get: getMock }),
        } as any);
  
        const req = {} as Request;
        const res = { status: jest.fn().mockReturnThis(), json: jest.fn() } as unknown as Response;
  
        await getUserTrends(req, res);
  
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
          trends: [
            { trend: "buy", count: 10 },
            { trend: "sell", count: 5 },
          ],
          source: "FIRESTORE",
        });
      });
  
      it("should handle error on user trends", async () => {
        const mockGet = jest.fn().mockRejectedValue(new Error("Error"));
  
        jest.spyOn(admin, "firestore").mockReturnValue({
          collection: jest.fn().mockReturnValue({ get: mockGet }),
        } as any);
  
        const req = {} as Request;
        const res = { status: jest.fn().mockReturnThis(), json: jest.fn() } as unknown as Response;

        clearCache("analytics_user_trends");

        await getUserTrends(req, res);
  
        expect(res.status).toHaveBeenCalledWith(500);
      });
    });
  
    // deleteNotification
    describe("deleteNotification", () => {
      let req: Request;
      let res: Response;
  
      beforeEach(() => {
        req = { params: { id: "123" } } as unknown as Request;
        res = {
          status: jest.fn().mockReturnThis(),
          json: jest.fn(),
        } as unknown as Response;
      });
  
      it("should delete notification successfully", async () => {
        const deleteMock = jest.fn().mockResolvedValue({});
        const docMock = jest.fn().mockReturnValue({ delete: deleteMock });
        const collectionMock = jest.fn().mockReturnValue({ doc: docMock });
  
        jest.spyOn(admin.firestore(), "collection").mockImplementation(collectionMock as any);
  
        await deleteNotification(req, res);
  
        expect(collectionMock).toHaveBeenCalledWith("notifications");
        expect(docMock).toHaveBeenCalledWith("123");
        expect(deleteMock).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({ message: "Notification deleted" });
      });
  
      it("should handle error when deleting notification", async () => {
        const deleteMock = jest.fn().mockRejectedValue(new Error("Error"));
        const docMock = jest.fn().mockReturnValue({ delete: deleteMock });
        const collectionMock = jest.fn().mockReturnValue({ doc: docMock });
  
        jest.spyOn(admin.firestore(), "collection").mockImplementation(collectionMock as any);
  
        await deleteNotification(req, res);
  
        expect(collectionMock).toHaveBeenCalledWith("notifications");
        expect(docMock).toHaveBeenCalledWith("123");
        expect(deleteMock).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ error: "Failed to delete notification" });
      });
    });
  
    // setNotification
    describe("setNotification", () => {
      it("should set notification successfully", async () => {
        const mockDocRef = { id: "notif123" };
        const mockAdd = jest.fn().mockResolvedValue(mockDocRef);
  
        const mockCollection = jest.fn(() => ({
          add: mockAdd,
        }));
  
        const mockedFirestore: any = { collection: mockCollection };
  
        (admin.firestore as any) = jest.fn(() => mockedFirestore);
        (admin.firestore.FieldValue as any) = {
          serverTimestamp: jest.fn(() => "mocked-timestamp"),
        };
  
        const req = {
          body: {
            userId: "user1",
            message: "Stock Alert",
            trigger: "price > 100",
          },
        } as unknown as Request;
  
        const res = {
          status: jest.fn().mockReturnThis(),
          json: jest.fn(),
        } as unknown as Response;
  
        await setNotification(req, res);
  
        expect(mockCollection).toHaveBeenCalledWith("notifications");
        expect(mockAdd).toHaveBeenCalledWith({
          userId: "user1",
          message: "Stock Alert",
          trigger: "price > 100",
          createdAt: "mocked-timestamp",
        });
  
        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith({
          message: "Notification set",
          id: "notif123",
        });
      });
  
      it("should handle error when setting notification", async () => {
        const mockAdd = jest.fn().mockRejectedValue(new Error("Firestore error"));
        const collectionMock = jest.fn().mockReturnValue({ add: mockAdd });
  
        jest.spyOn(admin.firestore(), "collection").mockImplementation(collectionMock as any);
  
        const req = {
          body: {
            userId: "user1",
            message: "Stock Alert",
            trigger: "price > 100",
          },
        } as Request;
  
        const res = { status: jest.fn().mockReturnThis(), json: jest.fn() } as unknown as Response;
  
        await setNotification(req, res);
  
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ error: "Failed to set notification" });
      });
    });
  });
      
  
      describe("GET /api/v1/analytics/market", () => {
        it("should return 200 with market performance data", async () => {
          mockUserRole = "Analyst";
          const mockDocs = [{ data: () => ({ index: "S&P 500", value: 4200 }) }];
      
          const mockGet = jest.fn().mockResolvedValue({ docs: mockDocs });
          const mockCollection = jest.fn(() => ({ get: mockGet }));
          jest.spyOn(admin, "firestore").mockReturnValue({ collection: mockCollection } as any);
      
          const res = await request(app)
            .get("/api/v1/analytics/market")
            .set("Authorization", "Bearer mockToken");
      
          expect(res.status).toBe(200);
          expect(res.body).toHaveProperty("data");
          expect(res.body.data[0]).toEqual({ index: "S&P 500", value: 4200 });
        });
      });
      
      describe("GET /api/v1/analytics/sector/:sector", () => {
        it("should return sector insights", async () => {
          mockUserRole = "Analyst";
          const mockGet = jest.fn().mockResolvedValue({
            exists: true,
            data: () => ({ sector: "Tech", performance: 12 }),
          });
      
          const mockDoc = jest.fn(() => ({ get: mockGet }));
          const mockCollection = jest.fn(() => ({ doc: mockDoc }));
          jest.spyOn(admin, "firestore").mockReturnValue({ collection: mockCollection } as any);
      
          const res = await request(app)
            .get("/api/v1/analytics/sector/Tech")
            .set("Authorization", "Bearer mockToken");
      
          expect(res.status).toBe(200);
          expect(res.body).toHaveProperty("insights");
          expect(res.body.insights).toEqual({ sector: "Tech", performance: 12 });
        });
      
        it("should return 404 if sector not found", async () => {
          const mockGet = jest.fn().mockResolvedValue({ exists: false });
          const mockDoc = jest.fn(() => ({ get: mockGet }));
          const mockCollection = jest.fn(() => ({ doc: mockDoc }));
          jest.spyOn(admin, "firestore").mockReturnValue({ collection: mockCollection } as any);
      
          const res = await request(app)
            .get("/api/v1/analytics/sector/UnknownSector")
            .set("Authorization", "Bearer mockToken");
      
          expect(res.status).toBe(404);
          expect(res.body).toHaveProperty("message", "Sector data not found");
        });
      });
      
      describe("GET /api/v1/analytics/top-movers", () => {
        it("should return top gainers and losers", async () => {
          mockUserRole = "Analyst";
          const gainersData = { data: () => ({ GOOGL: 5 }) };
          const losersData = { data: () => ({ TSLA: -3 }) };
      
          const gainersDoc = jest.fn().mockResolvedValue({
            exists: true,
            data: () => gainersData.data(),
          });
      
          const losersDoc = jest.fn().mockResolvedValue({
            exists: true,
            data: () => losersData.data(),
          });
      
          const docMock = jest.fn()
            .mockImplementationOnce(() => ({ get: gainersDoc }))
            .mockImplementationOnce(() => ({ get: losersDoc }));
      
          const collectionMock = jest.fn(() => ({ doc: docMock }));
          jest.spyOn(admin, "firestore").mockReturnValue({ collection: collectionMock } as any);
      
          const res = await request(app)
            .get("/api/v1/analytics/top-movers")
            .set("Authorization", "Bearer mockToken");
      
          expect(res.status).toBe(200);
          expect(res.body).toHaveProperty("topGainers");
          expect(res.body).toHaveProperty("topLosers");
        });
      });
      
      describe("GET /api/v1/analytics/user-trends", () => {
        beforeEach(() => {
            clearCache("analytics_user_trends"); 
          });

        it("should return user trend analytics", async () => {
          mockUserRole = "Admin";
          const mockDocs = [
            { data: () => ({ trend: "buy", count: 10 }) },
            { data: () => ({ trend: "sell", count: 5 }) },
          ];
      
          const mockGet = jest.fn().mockResolvedValue({ docs: mockDocs });
          const mockCollection = jest.fn(() => ({ get: mockGet }));
          jest.spyOn(admin, "firestore").mockReturnValue({ collection: mockCollection } as any);
      
          const res = await request(app)
            .get("/api/v1/analytics/user-trends")
            .set("Authorization", "Bearer mockToken");
      
          expect(res.status).toBe(200);
          expect(res.body).toEqual({
            trends: [
              { trend: "buy", count: 10 },
              { trend: "sell", count: 5 },
            ],
            source: "FIRESTORE",
          });
        });
      
        it("should handle error on fetching user trends", async () => {
          const mockGet = jest.fn().mockRejectedValue(new Error("Error"));
          const mockCollection = jest.fn(() => ({ get: mockGet }));
          jest.spyOn(admin, "firestore").mockReturnValue({ collection: mockCollection } as any);

          clearCache("analytics_user_trends");

          const res = await request(app)
            .get("/api/v1/analytics/user-trends")
            .set("Authorization", "Bearer mockToken");
      
          expect(res.status).toBe(500);
          expect(res.body).toHaveProperty("error", "Failed to fetch user trends");
        });
      });
      
      describe("POST /api/v1/analytics/notifications", () => {
        it("should set a notification and return 201", async () => {
          mockUserRole = "Investor";
          const mockAdd = jest.fn().mockResolvedValue({ id: "notif123" });
          const mockCollection = jest.fn(() => ({ add: mockAdd }));
      
          jest.spyOn(admin, "firestore").mockReturnValue({
            collection: mockCollection,
          } as any);
      
          (admin.firestore.FieldValue as any) = {
            serverTimestamp: jest.fn(() => "mocked-timestamp"),
          };
      
          const res = await request(app)
            .post("/api/v1/analytics/notifications")
            .set("Authorization", "Bearer mockToken")
            .send({
              userId: "user1",
              message: "Stock crossed threshold",
              trigger: "price > 100",
            });
      
          expect(res.status).toBe(201);
          expect(res.body).toEqual({
            message: "Notification set",
            id: "notif123",
          });
        });
      
        it("should handle error while setting notification", async () => {
          mockUserRole = "Investor";
          const mockAdd = jest.fn().mockRejectedValue(new Error("Firestore error"));
          const mockCollection = jest.fn(() => ({ add: mockAdd }));
      
          jest.spyOn(admin, "firestore").mockReturnValue({
            collection: mockCollection,
          } as any);
      
          const res = await request(app)
            .post("/api/v1/analytics/notifications")
            .set("Authorization", "Bearer mockToken")
            .send({
              userId: "user1",
              message: "Stock Alert",
              trigger: "price > 100",
            });
      
          expect(res.status).toBe(500);
          expect(res.body).toHaveProperty("error", "Failed to set notification");
        });
      });
      
      describe("DELETE /api/v1/analytics/notifications/:id", () => {
        it("should delete the notification and return 200", async () => {
          mockUserRole = "Investor";
          const mockDelete = jest.fn().mockResolvedValue({});
          const mockDoc = jest.fn(() => ({ delete: mockDelete }));
          const mockCollection = jest.fn(() => ({ doc: mockDoc }));
      
          jest.spyOn(admin, "firestore").mockReturnValue({
            collection: mockCollection,
          } as any);
      
          const res = await request(app)
            .delete("/api/v1/analytics/notifications/123")
            .set("Authorization", "Bearer mockToken");
      
          expect(res.status).toBe(200);
          expect(res.body).toEqual({ message: "Notification deleted" });
        });
      
        it("should handle error on deleting notification", async () => {
          const mockDelete = jest.fn().mockRejectedValue(new Error("Firestore error"));
          const mockDoc = jest.fn(() => ({ delete: mockDelete }));
          const mockCollection = jest.fn(() => ({ doc: mockDoc }));
      
          jest.spyOn(admin, "firestore").mockReturnValue({
            collection: mockCollection,
          } as any);
      
          const res = await request(app)
            .delete("/api/v1/analytics/notifications/123")
            .set("Authorization", "Bearer mockToken");
      
          expect(res.status).toBe(500);
          expect(res.body).toHaveProperty("error", "Failed to delete notification");
        });
      });