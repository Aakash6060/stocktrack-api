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
interface AuthRequestBody {
  email: string;
  password: string;
}

export const registerUser = async (
  req: Request<object, object, AuthRequestBody>,
  res: Response
): Promise<void> => {
  const { email, password } = req.body;
  try {
    const user: admin.auth.UserRecord = await admin.auth().createUser({ email, password });
    res.status(201).json({ uid: user.uid, email: user.email });
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(500).json({ message: "Registration failed", error: error.message });
    } else {
      res.status(500).json({ message: "Registration failed", error: "Unknown error" });
    }
  }
};

/**
 * Interface for Firebase Identity Toolkit Login response.
 */
interface FirebaseLoginResponse {
  kind: string;
  localId: string;
  email: string;
  displayName: string;
  idToken: string;
  registered: boolean;
  refreshToken: string;
  expiresIn: string;
}

/**
 * Logs in a user via Firebase Identity Toolkit.
 *
 * @route POST /auth/login
 * @param req - Express request object containing `email` and `password` in the body
 * @param res - Express response object
 * @returns Firebase ID token and user info on success, 401 on invalid credentials
 */
export const loginUser = async (
  req: Request<object, object, AuthRequestBody>,
  res: Response
): Promise<void> => {
  const { email, password } = req.body;

  try {
    const result: { data: FirebaseLoginResponse } = await axios.post(
      `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${process.env.FIREBASE_API_KEY}`,
      { email, password, returnSecureToken: true }
    );
    res.json(result.data);
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(401).json({ message: "Invalid credentials", error: error.message });
    } else {
      res.status(401).json({ message: "Invalid credentials", error: "Unknown error" });
    }
  }
};
