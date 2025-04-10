/**
 * @fileoverview Unit tests for Auth Middleware - verifyRole.
 * Tests role-based authorization using mocked Firebase Admin SDK.
 */

import { verifyRole } from "../src/middleware/auth";
import admin from "../src/config/firebase";
import { Request, Response, NextFunction } from "express";
import request from "supertest";
import express from "express";

// --- Mock Setup ---

/**
 * Mock Firebase Admin SDK's auth module.
 */
jest.mock("../src/config/firebase", () => ({
  auth: jest.fn().mockReturnValue({
    verifyIdToken: jest.fn(),
  }),
}));

// --- Test Suite ---

describe("Auth Middleware", () => {
  // --- verifyRole Tests ---
  describe("verifyRole", () => {
    /**
     * Test case: Should call `next()` when user has an authorized role.
     * Mocks Firebase `verifyIdToken` to return a token with `admin` role.
     */
    it("should pass when the user has the correct role", async () => {
      const req = {
        headers: {
          authorization: "Bearer mock-token",
        },
      } as unknown as Request;

      const res = {} as Response;
      const next = jest.fn() as NextFunction;

      const mockVerifyIdToken = admin.auth().verifyIdToken as jest.Mock;
      mockVerifyIdToken.mockResolvedValue({ role: "admin" });

      const middleware = verifyRole(["admin"]);
      await middleware(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    /**
     * Test case: Should return 403 when user has an unauthorized role.
     * Simulates a `user` role when `admin` is required.
     */
    it("should return 403 when the user does not have the correct role", async () => {
      const req = {
        headers: {
          authorization: "Bearer mock-token",
        },
      } as unknown as Request;

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as unknown as Response;

      const next = jest.fn() as NextFunction;

      const mockVerifyIdToken = admin.auth().verifyIdToken as jest.Mock;
      mockVerifyIdToken.mockResolvedValue({ role: "user" });

      const middleware = verifyRole(["admin"]);
      await middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ error: "Forbidden: insufficient role" });
    });
  });
});

describe("Auth Middleware (Integration Tests)", () => {
  const app = express();
  app.use(express.json());

  // Protected test route
  app.get("/test-protected", verifyRole(["admin"]), (req: Request, res: Response) => {
    res.status(200).json({ message: "Access granted" });
  });

  it("should return 200 if token is valid and role is allowed", async () => {
    const mockVerifyIdToken = admin.auth().verifyIdToken as jest.Mock;
    mockVerifyIdToken.mockResolvedValue({ role: "admin" });

    const res = await request(app)
      .get("/test-protected")
      .set("Authorization", "Bearer valid-token");

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ message: "Access granted" });
  });

  it("should return 403 if role is not allowed", async () => {
    const mockVerifyIdToken = admin.auth().verifyIdToken as jest.Mock;
    mockVerifyIdToken.mockResolvedValue({ role: "guest" });

    const res = await request(app)
      .get("/test-protected")
      .set("Authorization", "Bearer valid-token");

    expect(res.status).toBe(403);
    expect(res.body).toEqual({ error: "Forbidden: insufficient role" });
  });

  it("should return 401 if token is missing", async () => {
    const res = await request(app).get("/test-protected");
    expect(res.status).toBe(401);
    expect(res.body).toEqual({ error: "Missing token" });
  });

  it("should return 401 if token is invalid", async () => {
    const mockVerifyIdToken = admin.auth().verifyIdToken as jest.Mock;
    mockVerifyIdToken.mockRejectedValue(new Error("Invalid token"));

    const res = await request(app)
      .get("/test-protected")
      .set("Authorization", "Bearer invalid-token");

    expect(res.status).toBe(401);
    expect(res.body).toEqual({ error: "Invalid token" });
  });
});