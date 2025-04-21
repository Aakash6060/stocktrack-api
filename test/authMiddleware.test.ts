/**
 * @fileoverview Unit and Integration tests for Auth Middleware - verifyRole and verifySelfOrAdmin.
 * Tests role-based authorization using mocked Firebase Admin SDK.
 */

import { verifyRole, verifySelfOrAdmin } from "../src/middleware/auth";
import admin from "../src/config/firebase";
import { Request, Response, NextFunction } from "express";
import request from "supertest";
import express from "express";

// --- Mock Setup ---
/**
 * Mocks Firebase Admin SDK's auth module.
 * Simulates Firebase's `verifyIdToken` function for testing purposes, without actual Firebase calls.
 */
jest.mock("../src/config/firebase", () => ({
  auth: jest.fn().mockReturnValue({
    verifyIdToken: jest.fn(),
  }),
}));

// --- Test Suite ---
/**
 * Test suite for the Auth Middleware functions:
 * 1. verifyRole - Verifies role-based access control using Firebase ID tokens.
 * 2. verifySelfOrAdmin - Verifies whether a user can access resources based on their role or ownership.
 */
describe("Auth Middleware", () => {
  
  // --- verifyRole Tests ---
  describe("verifyRole", () => {
    /**
     * Test case: Should call `next()` when user has an authorized role.
     * Simulates a successful verification with the `admin` role.
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
     * Simulates a `user` role when `admin` is required, expecting a forbidden error.
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

    /**
     * Test case: Should return 401 when token is missing.
     * Verifies that a 401 error is returned when the token is not present in the request.
     */
    it("should return 401 when token is missing", async () => {
      const req = {
        headers: {},
      } as unknown as Request;

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as unknown as Response;

      const next = jest.fn() as NextFunction;

      const middleware = verifyRole(["admin"]);
      await middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: "Missing token" });
    });

    /**
     * Test case: Should return 401 when verifyIdToken throws.
     * Simulates an error thrown by the `verifyIdToken` method, verifying that the middleware returns a 401 error.
     */
    it("should return 401 when verifyIdToken throws", async () => {
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
      mockVerifyIdToken.mockRejectedValue(new Error("Invalid"));

      const middleware = verifyRole(["admin"]);
      await middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: "Invalid token" });
    });

    /**
     * Test case: Should pass if role is found inside customClaims.
     * Verifies that the middleware successfully handles a user with role in `customClaims`.
     */
    it("should pass if role is found inside customClaims", async () => {
      const req = {
        headers: {
          authorization: "Bearer mock-token",
        },
      } as unknown as Request;

      const res = {} as Response;
      const next = jest.fn() as NextFunction;

      const mockVerifyIdToken = admin.auth().verifyIdToken as jest.Mock;
      mockVerifyIdToken.mockResolvedValue({
        customClaims: { role: "admin" },
      });

      const middleware = verifyRole(["admin"]);
      await middleware(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    /**
     * Test case: Should return 403 if customClaims role is not allowed.
     * Verifies that the middleware returns a 403 if the role in `customClaims` is not allowed.
     */
    it("should return 403 if customClaims role is not allowed", async () => {
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
      mockVerifyIdToken.mockResolvedValue({
        customClaims: { role: "Student" },
      });

      const middleware = verifyRole(["Admin"]);
      await middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ error: "Forbidden: insufficient role" });
    });

    /**
     * Test case: Should return 403 when customClaims exist but role is undefined.
     * Verifies that the middleware returns a 403 error if `customClaims` does not include a valid role.
     */
    it("should return 403 when customClaims exist but role is undefined", async () => {
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
      mockVerifyIdToken.mockResolvedValue({
        customClaims: {},
      });

      const middleware = verifyRole(["admin"]);
      await middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ error: "Forbidden: insufficient role" });
    });

    /**
     * Test case: Should return 403 if role is missing entirely.
     * Verifies that the middleware returns a 403 error if the role is missing from the decoded token.
     */
    it("should return 403 if role is missing entirely", async () => {
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
      mockVerifyIdToken.mockResolvedValue({});

      const middleware = verifyRole(["admin"]);
      await middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ error: "Forbidden: insufficient role" });
    });
  });
});

/**
 * @fileoverview Integration tests for Auth Middleware functions:
 * 1. verifyRole - Verifies if the user has the correct role to access a protected route.
 * 2. verifySelfOrAdmin - Verifies if the user is either the resource owner or an admin.
 * Uses Jest and Supertest for testing the middleware with mocked Firebase Admin SDK.
 */

// --- Integration Tests ---
describe("Auth Middleware (Integration Tests)", () => {
  const app = express();
  app.use(express.json());

  // Protected test route
  app.get("/test-protected", verifyRole(["admin"]), (req: Request, res: Response) => {
    res.status(200).json({ message: "Access granted" });
  });

  app.get("/users/:id", verifySelfOrAdmin, (req: Request, res: Response) => {
    res.status(200).json({ message: "Access granted by self or admin" });
  });

  // --- verifyRole Tests ---
  /**
   * Test case: Should return 200 if token is valid and role is allowed.
   * Mocks Firebase `verifyIdToken` to return a valid token with the `admin` role.
   * Verifies that the request to a protected route succeeds.
   */
  it("should return 200 if token is valid and role is allowed", async () => {
    const mockVerifyIdToken = admin.auth().verifyIdToken as jest.Mock;
    mockVerifyIdToken.mockResolvedValue({ role: "admin" });

    const res = await request(app)
      .get("/test-protected")
      .set("Authorization", "Bearer valid-token");

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ message: "Access granted" });
  });

  /**
   * Test case: Should return 403 if role is not allowed.
   * Mocks Firebase `verifyIdToken` to return a token with an unauthorized role (`guest`).
   * Verifies that access is denied with status 403.
   */
  it("should return 403 if role is not allowed", async () => {
    const mockVerifyIdToken = admin.auth().verifyIdToken as jest.Mock;
    mockVerifyIdToken.mockResolvedValue({ role: "guest" });

    const res = await request(app)
      .get("/test-protected")
      .set("Authorization", "Bearer valid-token");

    expect(res.status).toBe(403);
    expect(res.body).toEqual({ error: "Forbidden: insufficient role" });
  });

  /**
   * Test case: Should return 401 if token is missing.
   * Verifies that if the authorization token is missing, the request is denied with status 401.
   */
  it("should return 401 if token is missing", async () => {
    const res = await request(app).get("/test-protected");

    expect(res.status).toBe(401);
    expect(res.body).toEqual({ error: "Missing token" });
  });

  /**
   * Test case: Should return 401 if token is invalid.
   * Mocks Firebase `verifyIdToken` to throw an error and verifies that the middleware returns a 401 status.
   */
  it("should return 401 if token is invalid", async () => {
    const mockVerifyIdToken = admin.auth().verifyIdToken as jest.Mock;
    mockVerifyIdToken.mockRejectedValue(new Error("Invalid token"));

    const res = await request(app)
      .get("/test-protected")
      .set("Authorization", "Bearer invalid-token");

    expect(res.status).toBe(401);
    expect(res.body).toEqual({ error: "Invalid token" });
  });

  // --- verifySelfOrAdmin Tests ---
  /**
   * Test case: Should return 403 if user is neither self nor admin.
   * Mocks Firebase `verifyIdToken` to simulate an `Investor` role and verifies that the request to access a user's data is denied.
   */
  it("should return 403 if user is neither self nor admin", async () => {
    const mockVerifyIdToken = admin.auth().verifyIdToken as jest.Mock;
    mockVerifyIdToken.mockResolvedValue({ uid: "user123", role: "Investor" });

    const res = await request(app)
      .get("/users/user456")
      .set("Authorization", "Bearer valid-token");

    expect(res.status).toBe(403);
    expect(res.body).toEqual({ error: "Forbidden: not owner or admin" });
  });

  /**
   * Test case: Should pass if user is self.
   * Mocks Firebase `verifyIdToken` to simulate that the user is accessing their own data, ensuring access is granted.
   */
  it("should pass if user is self", async () => {
    const mockVerifyIdToken = admin.auth().verifyIdToken as jest.Mock;
    mockVerifyIdToken.mockResolvedValue({ uid: "user123", role: "Investor" });

    const res = await request(app)
      .get("/users/user123")
      .set("Authorization", "Bearer valid-token");

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ message: "Access granted by self or admin" });
  });

  /**
   * Test case: Should pass if user is admin.
   * Mocks Firebase `verifyIdToken` to simulate an admin role, verifying that access is granted for any user.
   */
  it("should pass if user is admin", async () => {
    const mockVerifyIdToken = admin.auth().verifyIdToken as jest.Mock;
    mockVerifyIdToken.mockResolvedValue({ uid: "adminId", role: "Admin" });

    const res = await request(app)
      .get("/users/any-user")
      .set("Authorization", "Bearer valid-token");

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ message: "Access granted by self or admin" });
  });

  /**
   * Test case: Should return 401 if verifyIdToken throws error in verifySelfOrAdmin.
   * Simulates an error from `verifyIdToken` and ensures that the middleware handles it properly by returning a 401 status.
   */
  it("should return 401 if verifyIdToken throws error in verifySelfOrAdmin", async () => {
    const mockVerifyIdToken = admin.auth().verifyIdToken as jest.Mock;
    mockVerifyIdToken.mockRejectedValue(new Error("Bad token"));

    const res = await request(app)
      .get("/users/some-id")
      .set("Authorization", "Bearer bad-token");

    expect(res.status).toBe(401);
    expect(res.body).toEqual({ error: "Invalid token" });
  });

  /**
   * Test case: Should return 401 if token is missing in verifySelfOrAdmin.
   * Verifies that if the token is missing in the `verifySelfOrAdmin` middleware, a 401 status is returned.
   */
  it("should return 401 if token is missing in verifySelfOrAdmin", async () => {
    const res = await request(app).get("/users/123");

    expect(res.status).toBe(401);
    expect(res.body).toEqual({ error: "Missing token" });
  });
});
