import { Request, Response } from "express";
import admin from "../../../config/firebase";
import axios from "axios";

/**
 * Registers a new user using Firebase Authentication.
 *
 * @route POST /auth/register
 * @param req - Express request object containing `email` and `password` in the body
 * @param res - Express response object
 * @returns 201 with user UID and email on success, 500 on failure
 */
export const registerUser = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  try {
    const user = await admin.auth().createUser({ email, password });
    res.status(201).json({ uid: user.uid, email: user.email });
  } catch (error) {
    res.status(500).json({ message: "Registration failed", error });
  }
};

/**
 * Logs in a user via Firebase Identity Toolkit.
 *
 * @route POST /auth/login
 * @param req - Express request object containing `email` and `password` in the body
 * @param res - Express response object
 * @returns Firebase ID token and user info on success, 401 on invalid credentials
 */
export const loginUser = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    const result = await axios.post(
      `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${process.env.FIREBASE_API_KEY}`,
      { email, password, returnSecureToken: true }
    );
    res.json(result.data);
  } catch (error) {
    res.status(401).json({ message: "Invalid credentials" });
  }
};