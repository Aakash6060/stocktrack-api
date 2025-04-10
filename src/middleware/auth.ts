import { Request, Response, NextFunction } from "express";
import admin from "../config/firebase";

// Extend the Request interface to add the 'user' property
declare global {
  namespace Express {
    interface Request {
      user?: admin.auth.DecodedIdToken;
    }
  }
}

/**
 * Middleware to verify if the authenticated user has one of the allowed roles.
 *
 * @param {string[]} allowedRoles - An array of roles that are allowed to access the route.
 * @returns {Function} Express middleware function.
 *
 * This middleware:
 * - Extracts the Bearer token from the Authorization header.
 * - Verifies the token using Firebase Admin SDK.
 * - Checks if the decoded token contains a role that is allowed.
 * - Attaches the decoded user info to `req.user` if authorized.
 * - Responds with 401 if the token is missing or invalid.
 * - Responds with 403 if the role is not permitted.
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
    const userRole = decoded.role || (decoded as any).customClaims?.role;

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
 * Middleware to verify if the authenticated user is either:
 * - the same as the user in `req.params.id`, OR
 * - has an Admin role.
 *
 * This is useful for endpoints like /users/:id where both the user and Admin should have access.
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
    const userRole = decoded.role || (decoded as any).customClaims?.role;
    const userId = req.params.id;

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
