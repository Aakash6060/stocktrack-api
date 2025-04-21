import { Request, Response, NextFunction } from "express";
import admin from "../config/firebase";

// Extend Express Request to include Firebase-decoded user info
declare module "express" {
  export interface Request {
    user?: admin.auth.DecodedIdToken;
  }
}

/**
 * Safely extract the custom user role from the decoded Firebase token.
 *
 * @param {admin.auth.DecodedIdToken} decoded - Firebase token
 * @returns {string | undefined} The role string, if it exists
 */
const getUserRole = (decoded: admin.auth.DecodedIdToken): string | undefined => {
  if ("role" in decoded && typeof decoded.role === "string") {
    return decoded.role;
  }

  const claims: admin.auth.DecodedIdToken & {
    customClaims?: { role?: string };
  } = decoded;

  return claims.customClaims?.role;
};

/**
 * Middleware to verify if the authenticated user has one of the allowed roles.
 *
 * @param {string[]} allowedRoles - List of roles allowed to access this route
 * @returns {Function} Express middleware that enforces role-based access
 *
 * Behavior:
 * - Extracts the Bearer token from the `Authorization` header
 * - Verifies the token using Firebase Admin SDK
 * - Extracts custom claims to determine the user's role
 * - Allows access if the user's role matches one in `allowedRoles`
 * - Attaches the decoded token to `req.user`
 * - Responds with 401 (unauthorized) or 403 (forbidden) if conditions aren't met
 */
export const verifyRole = (allowedRoles: string[]) => async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const token: string | undefined = req.headers.authorization?.split("Bearer ")[1];

  if (!token) {
    res.status(401).json({ error: "Missing token" });
    return;
  }

  try {
    const decoded: admin.auth.DecodedIdToken = await admin.auth().verifyIdToken(token);
    const userRole: string | undefined = getUserRole(decoded);

    if (!userRole || !allowedRoles.includes(userRole)) {
      res.status(403).json({ error: "Forbidden: insufficient role" });
      return;
    }

    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
};

/**
 * Middleware to verify if the authenticated user:
 * - matches the `:id` param in the request path, OR
 * - has the "Admin" role
 *
 * This is useful for routes like GET `/users/:id`, where users can view
 * their own profile or Admins can view any profile.
 *
 * Responds with:
 * - 401 if token is missing or invalid
 * - 403 if the user is neither the resource owner nor an Admin
 */
export const verifySelfOrAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const token: string | undefined = req.headers.authorization?.split("Bearer ")[1];

  if (!token) {
    res.status(401).json({ error: "Missing token" });
    return;
  }

  try {
    const decoded: admin.auth.DecodedIdToken = await admin.auth().verifyIdToken(token);
    const userRole: string | undefined = getUserRole(decoded);
    const userId: string = req.params.id;

    if (decoded.uid !== userId && userRole !== "Admin") {
      res.status(403).json({ error: "Forbidden: not owner or admin" });
      return;
    }

    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
};