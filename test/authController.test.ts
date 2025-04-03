/**
 * @fileoverview Unit tests for Auth Controller - registerUser and loginUser.
 * Uses Jest to test Firebase and Axios integration.
 */

import { registerUser, loginUser } from "../src/api/v1/controllers/authController";
import admin from "../src/config/firebase";
import axios from "axios";
import { Request, Response } from "express";

// --- Mock Setup ---

/**
 * Mock Firebase Admin SDK's auth module.
 */
jest.mock("../src/config/firebase", () => ({
  auth: jest.fn().mockReturnValue({
    createUser: jest.fn(),
  }),
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
        uid: "12345",
        email: "test@example.com",
      });

      await registerUser(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        uid: "12345",
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
        error: expect.any(Error),
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
      expect(res.json).toHaveBeenCalledWith({ message: "Invalid credentials" });
    });
  });
});
