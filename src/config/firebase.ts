/**
 * @fileoverview Initializes Firebase Admin SDK and exports Firestore database instance.
 * 
 * This module sets up Firebase Admin using service account credentials. It allows 
 * access to Firestore for server-side operations.
 */

import * as dotenv from 'dotenv';
import admin from 'firebase-admin';

// Load environment variables from .env file
dotenv.config();

/**
 * Load the Firebase service account credentials.
 * 
 * Credentials are either loaded from the environment variable 
 * `FIREBASE_SERVICE_ACCOUNT_KEY` or from a local file `serviceAccountKey.json`
 * as a fallback (useful during development).
 */
const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY
  ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY)
  : require("../../serviceAccountKey.json");

/**
 * Initialize Firebase Admin SDK using the provided credentials.
 */
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
});

/**
 * Firestore database instance.
 * 
 * Exported for use throughout the application.
 */
export const db = admin.firestore();

/**
 * Export the initialized admin instance to allow access 
 * to other Firebase Admin features if needed.
 */
export default admin;
