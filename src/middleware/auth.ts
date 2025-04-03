import { Request, Response, NextFunction } from "express";
import admin from "../config/firebase";

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

    req.user = decoded; 
    next(); 
  } catch (err) {
    res.status(401).json({ error: "Invalid token" });
  }
};
