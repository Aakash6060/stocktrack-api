import { Request, Response, NextFunction } from "express";
import admin from "../config/firebase";

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
  const token = req.headers.authorization?.split("Bearer ")[1];
  if (!token) {
    res.status(401).json({ error: "Missing token" });
    return;
  }

  try {
    const decoded = await admin.auth().verifyIdToken(token);

    if (!allowedRoles.includes(decoded.role)) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }

    // Attach decoded user info to request object for later use
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: "Invalid token" });
  }
};
