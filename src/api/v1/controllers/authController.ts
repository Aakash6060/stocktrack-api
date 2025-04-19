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
      `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${process.env.FIREBASE_API_KEY as string}`,
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

interface SetUserRoleBody {
  uid: string;
  role: string;
}

/**
 * Sets a custom role for a user using Firebase Admin SDK.
 *
 * @route POST /auth/set-role
 * @param req - Express request object containing `uid` and `role`
 * @param res - Express response object
 */
export const setUserRole = async (
  req: Request<object, object, SetUserRoleBody>,
  res: Response
): Promise<void> => {
  const { uid, role } = req.body;
  try {
    await admin.auth().setCustomUserClaims(uid, { role });
    res.status(200).json({ message: `Role '${role}' set for user ${uid}` });
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(500).json({ message: "Failed to set user role", error: error.message });
    } else {
      res.status(500).json({ message: "Failed to set user role", error: "Unknown error" });
    }
  }
};

/**
 * Retrieves a list of all users. Can be filtered by role if needed.
 *
 * @route GET /users
 * @param req - Express request object
 * @param res - Express response object
 */
export const listUsers = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const listUsersResult: admin.auth.ListUsersResult = await admin.auth().listUsers();
    const users: {
      uid: string;
      email: string | undefined;
      displayName: string | undefined;
      customClaims: admin.auth.UserRecord["customClaims"];
    }[] = listUsersResult.users.map((user: admin.auth.UserRecord) => ({
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      customClaims: user.customClaims ?? {},
    }));
    res.status(200).json({ users });
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(500).json({ message: "Failed to list users", error: error.message });
    } else {
      res.status(500).json({ message: "Failed to list users", error: "Unknown error" });
    }
  }
};

/**
 * Retrieves a user by ID (Admin or owner only).
 *
 * @route GET /users/:id
 * @param req - Express request object containing user ID
 * @param res - Express response object
 */
export const getUserById = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params;
  try {
    const user: admin.auth.UserRecord = await admin.auth().getUser(id);
    res.status(200).json({
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      customClaims: user.customClaims ?? {},
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(404).json({ message: "User not found", error: error.message });
    } else {
      res.status(404).json({ message: "User not found", error: "Unknown error" });
    }
  }
};
