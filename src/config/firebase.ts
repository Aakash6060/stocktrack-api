/**
 * @fileoverview Initializes Firebase Admin SDK and exports Firestore database instance.
 * 
 * This module sets up Firebase Admin using service account credentials. It allows 
 * access to Firestore for server-side operations and optionally exports the full 
 * admin SDK for authentication and other services.
 */

import * as dotenv from 'dotenv';
import admin from 'firebase-admin';
import { ServiceAccount } from 'firebase-admin';
import { Firestore } from 'firebase-admin/firestore';
import fs from 'fs';

// Load environment variables from .env file
dotenv.config();

/**
 * Load the Firebase service account credentials.
 * 
 * Credentials are loaded from either:
 * - Environment variable `FIREBASE_SERVICE_ACCOUNT_KEY` (recommended in production)
 * - Fallback local file `serviceAccountKey.json` (for development)
 */
let serviceAccount: ServiceAccount;

if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
  try {
    const parsed: unknown = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
    if (typeof parsed === 'object' && parsed !== null) {
      serviceAccount = parsed as ServiceAccount;
    } else {
      throw new Error('Invalid FIREBASE_SERVICE_ACCOUNT_KEY format.');
    }
  } catch (error: unknown) {
    const message: string =
      error instanceof Error ? error.message : String(error);
    throw new Error('Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY: ' + message);
  }
} else {
  // Local fallback for development
  const path: string = require.resolve('../../serviceAccountKey.json');
  const rawKey: string = fs.readFileSync(path, 'utf-8');
  const parsedKey: unknown = JSON.parse(rawKey);

  if (typeof parsedKey === 'object' && parsedKey !== null) {
    serviceAccount = parsedKey as ServiceAccount;
  } else {
    throw new Error('Invalid format in serviceAccountKey.json');
  }
}

/**
 * Initialize Firebase Admin SDK using the provided credentials.
 */
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

/**
 * Firestore database instance.
 *
 * @type {Firestore}
 * @example
 * import { db } from './config/firebase';
 * const snapshot = await db.collection('users').get();
 */
export const db: Firestore = admin.firestore();

/**
 * Export the initialized admin instance for use with Firebase Auth, Storage, etc.
 *
 * @type {admin.app.App}
 */
export default admin;
