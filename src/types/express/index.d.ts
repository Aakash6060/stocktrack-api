/**
 * Extends the Express Request interface to include Firebase Auth decoded token
 * and typed request bodies for authentication endpoints.
 * 
 * This allows usage like:
 * ```ts
 * const uid = req.user?.uid;
 * const { email, password } = req.body;
 * ```
 */

import * as admin from "firebase-admin";

/**
 * Shape of request body used for authentication (login/register).
 */
export interface AuthRequestBody {
  email: string;
  password: string;
}

// Extend Express Request globally
declare global {
  namespace Express {
    interface Request {
      /**
       * The Firebase decoded ID token.
       * Available only after successful Firebase auth middleware.
       */
      user?: admin.auth.DecodedIdToken;

      /**
       * Strongly-typed request body for authentication routes.
       * Automatically inferred in login/register routes.
       */
      body: AuthRequestBody;
    }
  }
}

// Mark this file as a module
export {};
