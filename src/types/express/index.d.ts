/**
 * Extends the Express Request interface to include Firebase Auth decoded token.
 * 
 * This allows access to `req.user` throughout the app after Firebase authentication middleware
 * has decoded the ID token. The `user` field will contain the decoded Firebase ID token payload.
 * 
 * Example usage in a route:
 * ```ts
 * app.get('/profile', (req, res) => {
 *   const uid = req.user?.uid; // Access Firebase UID
 *   res.send(`User ID: ${uid}`);
 * });
 * ```
 */

import * as admin from "firebase-admin";

declare global {
  namespace Express {
    interface Request {
      /**
       * The Firebase decoded ID token, added to the request after authentication.
       * Optional because unauthenticated requests won't have this field.
       */
      user?: admin.auth.DecodedIdToken;
    }
  }
}

// Required to ensure this file is treated as a module
export {};