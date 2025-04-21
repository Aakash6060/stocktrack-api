import { Request, Response } from "express";
import admin from "../../../config/firebase";
import axios from "axios";

/**
 * @route POST /auth/register
 * @group Authentication - Firebase Auth management
 * @description Registers a new user using Firebase Authentication.
 * 
 * @param {Request} req - Express request object with `email` and `password`
 * @param {object} req.body
 * @param {string} req.body.email - User's email address
 * @param {string} req.body.password - User's password
 * @example request - Registration payload
 * {
 *   "email": "user@example.com",
 *   "password": "StrongPassword123"
 * }
 * 
 * @param {Response} res - Express response object
 * 
 * @returns {Promise<void>} 201 Created with { uid, email } on success; 500 on failure
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
 * @route POST /auth/login
 * @group Authentication - Firebase Auth management
 * @description Logs in a user via Firebase Identity Toolkit and returns an ID token.
 * 
 * @param {Request} req - Express request object with `email` and `password`
 * @param {object} req.body
 * @param {string} req.body.email - User's email address
 * @param {string} req.body.password - User's password
 * @example request - Login payload
 * {
 *   "email": "user@example.com",
 *   "password": "StrongPassword123"
 * }
 * 
 * @param {Response} res - Express response object
 * 
 * @returns {Promise<void>} 200 OK with ID token and user info on success; 401 on invalid credentials
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
 * @route POST /auth/set-role
 * @group Authentication - Firebase Auth management
 * @description Sets a custom role for a Firebase-authenticated user.
 * 
 * @param {Request} req - Express request with `uid` and `role` in the body
 * @param {object} req.body
 * @param {string} req.body.uid - Firebase user ID
 * @param {string} req.body.role - Custom role (e.g., admin, analyst, investor)
 * @example request - Set role payload
 * {
 *   "uid": "abc123",
 *   "role": "admin"
 * }
 * 
 * @param {Response} res - Express response object
 * 
 * @returns {Promise<void>} 200 OK on success; 500 on failure
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
 * @route GET /users
 * @group Users - Admin & user lookup operations
 * @description Retrieves a list of all users with basic metadata and roles.
 * 
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * 
 * @returns {Promise<void>} 200 OK with user list; 500 on error
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
 * @route GET /users/:id
 * @group Users - Admin & user lookup operations
 * @description Retrieves a user by their Firebase UID (Admin or Owner access only).
 * 
 * @param {Request} req - Express request object with `id` param
 * @param {string} req.params.id - Firebase UID of the user
 * @param {Response} res - Express response object
 * 
 * @returns {Promise<void>} 200 OK with user data; 404 if not found
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
