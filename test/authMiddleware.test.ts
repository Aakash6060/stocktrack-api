/**
 * @fileoverview Unit tests for Auth Middleware - verifyRole.
 * Tests role-based authorization using mocked Firebase Admin SDK.
 */

import { verifyRole } from "../src/middleware/auth";
import admin from "../src/config/firebase";
import { Request, Response, NextFunction } from "express";

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
      expect(res.json).toHaveBeenCalledWith({ error: "Forbidden" });
    });
  });
});
