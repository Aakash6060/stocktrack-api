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
  const token: string | undefined = req.headers.authorization?.split("Bearer ")[1];
  if (!token) {
    res.status(401).json({ error: "Missing token" });
    return;
  }

  try {
    const decoded: admin.auth.DecodedIdToken = await admin.auth().verifyIdToken(token);

    const userRole: string | undefined = decoded.role as string | undefined;
    if (!userRole || !allowedRoles.includes(userRole)) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }

    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
};
