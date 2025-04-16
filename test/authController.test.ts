/**
 * @fileoverview Unit tests for Auth Controller - registerUser and loginUser.
 * Uses Jest to test Firebase and Axios integration.
 */

import { registerUser, loginUser, setUserRole, listUsers, getUserById } from "../src/api/v1/controllers/authController";
import admin from "../src/config/firebase";
import axios from "axios";
import request from "supertest";
import app from "../src/app";
import { Request, Response } from "express";

// --- Mock Setup ---

/**
 * Mock Firebase Admin SDK's auth module.
 */
const mockAuth = {
  createUser: jest.fn(),
  setCustomUserClaims: jest.fn(),
  listUsers: jest.fn(),
  getUser: jest.fn(),
  verifyIdToken: jest.fn(),
};

/**
 * Mock Firebase Admin SDK's auth module
 */
jest.mock("../src/config/firebase", () => ({
  __esModule: true,
  default: {
    auth: jest.fn(() => mockAuth),
  },
}));

/**
 * Mock Axios for login requests.
 */
jest.mock("axios");

// --- Test Suite ---

describe("Auth Controller", () => {
  // --- registerUser Tests ---
  describe("registerUser", () => {
    /**
     * Test case: Should register a user successfully.
     * Mocks Firebase `createUser` and simulates a successful registration.
     */
    it("should register a user successfully", async () => {
      const req = {
        body: {
          email: "test@example.com",
          password: "password123",
        },
      } as Request;

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as unknown as Response;

      const mockCreateUser = admin.auth().createUser as jest.Mock;
      mockCreateUser.mockResolvedValue({
        uid: "mock-uid",
        email: "test@example.com",
      });

      await registerUser(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        uid: "mock-uid",
        email: "test@example.com",
      });
    });

    /**
     * Test case: Should handle error when registration fails.
     * Mocks Firebase `createUser` to reject and verifies proper error handling.
     */
    it("should handle error when registration fails", async () => {
      const req = {
        body: {
          email: "test@example.com",
          password: "password123",
        },
      } as Request;

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as unknown as Response;

      const mockCreateUser = admin.auth().createUser as jest.Mock;
      mockCreateUser.mockRejectedValue(new Error("Registration failed"));

      await registerUser(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Registration failed",
        error: "Registration failed",
      });
    });
  });

  // --- loginUser Tests ---
  describe("loginUser", () => {
    /**
     * Test case: Should log in a user successfully.
     * Mocks Axios POST request to Firebase Identity Toolkit and simulates success.
     */
    it("should log in a user successfully", async () => {
      const req = {
        body: {
          email: "test@example.com",
          password: "password123",
        },
      } as Request;

      const res = {
        json: jest.fn(),
      } as unknown as Response;

      const mockAxiosPost = axios.post as jest.Mock;
      mockAxiosPost.mockResolvedValue({
        data: {
          idToken: "mock-token",
          email: "test@example.com",
        },
      });

      await loginUser(req, res);

      expect(res.json).toHaveBeenCalledWith({
        idToken: "mock-token",
        email: "test@example.com",
      });
    });

    /**
     * Test case: Should handle invalid credentials.
     * Mocks Axios POST to simulate login failure due to incorrect credentials.
     */
    it("should handle invalid credentials", async () => {
      const req = {
        body: {
          email: "wrong@example.com",
          password: "wrongpassword",
        },
      } as Request;

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as unknown as Response;

      const mockAxiosPost = axios.post as jest.Mock;
      mockAxiosPost.mockRejectedValue(new Error("Invalid credentials"));

      await loginUser(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        message: "Invalid credentials",
        error: "Invalid credentials",
      });
    });
  });
});

  // --- setUserRole Tests ---
  describe("setUserRole", () => {
    it("should set a user role successfully", async () => {
      const req = {
        body: {
          uid: "mock-uid",
          role: "admin",
        },
      } as Request;

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as unknown as Response;

      const mockSetCustomUserClaims = admin.auth().setCustomUserClaims as jest.Mock;
      mockSetCustomUserClaims.mockResolvedValue({});

      await setUserRole(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "Role 'admin' set for user mock-uid",
      });
    });

    it("should handle error when setting user role fails", async () => {
      const req = {
        body: {
          uid: "mock-uid",
          role: "admin",
        },
      } as Request;

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as unknown as Response;

      const mockSetCustomUserClaims = admin.auth().setCustomUserClaims as jest.Mock;
      mockSetCustomUserClaims.mockRejectedValue(new Error("Failed to set user role"));

      await setUserRole(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Failed to set user role",
        error: "Failed to set user role",
      });
    });
  });

  // --- listUsers Tests ---
  describe("listUsers", () => {
    it("should list users successfully", async () => {
      const req = {} as Request;

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as unknown as Response;

      const mockListUsers = admin.auth().listUsers as jest.Mock;
      mockListUsers.mockResolvedValue({
        users: [
          { uid: "mock-uid", email: "test@example.com", displayName: "Test User", customClaims: {} },
        ],
      });

      await listUsers(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        users: [
          { uid: "mock-uid", email: "test@example.com", displayName: "Test User", customClaims: {} },
        ],
      });
    });

    it("should handle error when listing users fails", async () => {
      const req = {} as Request;

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as unknown as Response;

      const mockListUsers = admin.auth().listUsers as jest.Mock;
      mockListUsers.mockRejectedValue(new Error("Failed to list users"));

      await listUsers(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Failed to list users",
        error: "Failed to list users",
      });
    });
  });

  // --- getUserById Tests ---
  describe("getUserById", () => {
    it("should retrieve a user by ID successfully", async () => {
      const req = {
        params: {
          id: "mock-uid",
        },
      } as unknown as Request;

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as unknown as Response;

      const mockGetUser = admin.auth().getUser as jest.Mock;
      mockGetUser.mockResolvedValue({
        uid: "mock-uid",
        email: "test@example.com",
        displayName: "Test User",
        customClaims: {},
      });

      await getUserById(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        uid: "mock-uid",
        email: "test@example.com",
        displayName: "Test User",
        customClaims: {},
      });
    });

    it("should handle error when user not found", async () => {
      const req = {
        params: {
          id: "mock-uid",
        },
      } as unknown as Request;

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as unknown as Response;

      const mockGetUser = admin.auth().getUser as jest.Mock;
      mockGetUser.mockRejectedValue(new Error("User not found"));

      await getUserById(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: "User not found",
        error: "User not found",
      });
    });
  });
  
describe("Auth Routes (Integration Tests)", () => {
  beforeEach(() => {
    mockAuth.verifyIdToken.mockResolvedValue({
      uid: "mockUid123",
      role: "Admin",
      customClaims: { role: "Admin" },
    });
  });

  it("should return 401 on login with invalid credentials", async () => {
    const res = await request(app).post("/api/v1/auth/login").send({
      email: "wrong@example.com",
      password: "wrongpassword",
    });

    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty("message", "Invalid credentials");
  });

  it("should return 500 on registration failure", async () => {
    const res = await request(app).post("/api/v1/auth/register").send({
      email: "",
      password: "123",
    });

    expect(res.status).toBe(500);
    expect(res.body).toHaveProperty("message", "Registration failed");
  });
});

  it("should set user role successfully", async () => {
    mockAuth.setCustomUserClaims.mockResolvedValueOnce({});
    const res = await request(app)
      .post("/api/v1/auth/set-role")
      .set("Authorization", "Bearer mockToken")
      .send({ uid: "mockUid123", role: "admin" });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("message", "Role 'admin' set for user mockUid123");
  });

  it("should list all users", async () => {
    mockAuth.listUsers.mockResolvedValueOnce({
      users: [
        {
          uid: "uid123",
          email: "test@example.com",
          displayName: "Test User",
          customClaims: { role: "investor" },
        },
      ],
    });

    const res = await request(app)
      .get("/api/v1/auth/users")
      .set("Authorization", "Bearer mockToken");

    expect(res.status).toBe(200);
    expect(res.body.users).toBeInstanceOf(Array);
    expect(res.body.users[0]).toMatchObject({
      uid: "uid123",
      email: "test@example.com",
      displayName: "Test User",
      customClaims: { role: "investor" },
    });
  });

  it("should retrieve a user by ID", async () => {
    mockAuth.getUser.mockResolvedValueOnce({
      uid: "uid456",
      email: "admin@example.com",
      displayName: "Admin User",
      customClaims: { role: "admin" },
    });

    const res = await request(app)
      .get("/api/v1/auth/users/uid456")
      .set("Authorization", "Bearer mockToken");

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      uid: "uid456",
      email: "admin@example.com",
      displayName: "Admin User",
      customClaims: { role: "admin" },
    });
  });