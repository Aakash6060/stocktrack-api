import { Request, Response } from "express";
import admin from "../../../config/firebase";
import { getCache, setCache } from "../services/cache.service";

/**
 * @route GET /analytics/market
 * @group Analytics - Stock market analytics and trends
 * @description View overall stock market performance (e.g., index growth, volume trends).
 * @access Analyst
 * 
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * 
 * @returns {Promise<void>} 200 OK with { data: [...], source: 'CACHE' | 'FIRESTORE' }
 */
export const getMarketPerformance = async (req: Request, res: Response): Promise<void> => {
  const cacheKey: string = "analytics_market";

  const cached: unknown = getCache(cacheKey);
  if (cached) {
    res.status(200).json({
      ...cached,
      source: "CACHE",
    });
    return;
  }

  try {
    const db: FirebaseFirestore.Firestore = admin.firestore();
    const snapshot: FirebaseFirestore.QuerySnapshot = await db.collection("marketPerformance").get();

    const data: FirebaseFirestore.DocumentData[] = snapshot.docs.map(doc => doc.data());

    const response: { data: FirebaseFirestore.DocumentData[] } = { data };

    setCache(cacheKey, response);

    res.status(200).json({
      ...response,
      source: "FIRESTORE", 
    });
    return;
  } catch {
    res.status(500).json({ error: "Failed to retrieve market performance" });
  }
};

/**
 * @route GET /analytics/sector/:sector
 * @group Analytics - Stock market analytics and trends
 * @description Get insights on a specific sector (e.g., technology, healthcare).
 * @access Analyst
 * 
 * @param {Request} req - Express request object with `sector` URL param
 * @param {Response} res - Express response object
 * 
 * @returns {Promise<void>} 200 OK with { insights: {...}, source: 'CACHE' | 'FIRESTORE' }
 */
export const getSectorInsights = async (req: Request, res: Response): Promise<void> => {
  const { sector } = req.params;
  const cacheKey: string = `analytics_sector_${sector}`;
  
  const cached: unknown = getCache(cacheKey);
  if (cached) {
    res.status(200).json({
      ...cached,
      source: "CACHE",
    });
    return;
  } 
  
  try {
    const db: FirebaseFirestore.Firestore = admin.firestore();

    const snapshot: FirebaseFirestore.DocumentSnapshot = await db.collection("sectors").doc(sector).get();

    if (!snapshot.exists) {
      res.status(404).json({ message: "Sector data not found" });
      return;
    }

    const insights: FirebaseFirestore.DocumentData | undefined = snapshot.data();
    const response: { insights: FirebaseFirestore.DocumentData | undefined } = { insights };

    setCache(cacheKey, response);

    res.status(200).json({
      ...response,
      source: "FIRESTORE"
    });
  } catch {
    res.status(500).json({ error: "Failed to retrieve sector insights" });
  }
};

/**
 * @route GET /analytics/top-movers
 * @group Analytics - Stock market analytics and trends
 * @description Retrieve top gaining and losing stocks based on market data.
 * @access Analyst
 * 
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * 
 * @returns {Promise<void>} 200 OK with { topGainers: {...}, topLosers: {...}, source: 'CACHE' | 'FIRESTORE' }
 */
export const getTopMovers = async (req: Request, res: Response): Promise<void> => {
  const cacheKey: string = "analytics_top_movers";

  const cached: unknown = getCache(cacheKey);
  if (cached) {
    res.status(200).json({
      ...cached,
      source: "CACHE",
    });
    return;
  }
     
  try {
    const db: FirebaseFirestore.Firestore = admin.firestore();

    const gainersSnap: FirebaseFirestore.DocumentSnapshot = await db.collection("topMovers").doc("gainers").get();
    const losersSnap: FirebaseFirestore.DocumentSnapshot = await db.collection("topMovers").doc("losers").get();

    const response: {
      topGainers: FirebaseFirestore.DocumentData | undefined,
      topLosers: FirebaseFirestore.DocumentData | undefined
    } = {
      topGainers: gainersSnap.data(),
      topLosers: losersSnap.data()
    };

    setCache(cacheKey, response);

    res.status(200).json({
      ...response,
      source: "FIRESTORE"
    });
  } catch {
    res.status(500).json({ error: "Failed to fetch top movers" });
  }
};

/**
 * @route GET /analytics/user-trends
 * @group Analytics - Stock market analytics and trends
 * @description Analyze user portfolio trends for admin-level decision-making.
 * @access Admin
 * 
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * 
 * @returns {Promise<void>} 200 OK with { trends: [...], source: 'CACHE' | 'FIRESTORE' }
 */
export const getUserTrends = async (req: Request, res: Response): Promise<void> => {
  const cacheKey: string = "analytics_user_trends";

  const cached: unknown = getCache(cacheKey);
  if (cached) {
    res.status(200).json({
      ...cached,
      source: "CACHE",
    });
    return;
  }

  try {
    const db: FirebaseFirestore.Firestore = admin.firestore();
    const trendsSnapshot: FirebaseFirestore.QuerySnapshot = await db.collection("userTrends").get();

    const trends: FirebaseFirestore.DocumentData[] = trendsSnapshot.docs.map(doc => doc.data());

    const response: { trends: FirebaseFirestore.DocumentData[] } = { trends };

    setCache(cacheKey, response);

    res.status(200).json({
      ...response,
      source: "FIRESTORE"
    });
  } catch {
    res.status(500).json({ error: "Failed to fetch user trends" });
  }
};

interface NotificationInput {
  userId: string;
  message: string;
  trigger: string;
}

/**
 * @route POST /notifications
 * @group Notifications - User-triggered stock alerts and preferences
 * @description Set a user-specific notification based on trigger criteria.
 * @access Investor
 * 
 * @param {Request} req - Express request object containing notification data
 * @param {object} req.body
 * @param {string} req.body.userId - Firebase user ID
 * @param {string} req.body.message - Notification message
 * @param {string} req.body.trigger - Trigger condition (e.g., stock price > 100)
 * @example request - notification payload
 * {
 *   "userId": "abc123",
 *   "message": "AAPL has reached $150",
 *   "trigger": "AAPL > 150"
 * }
 * 
 * @param {Response} res - Express response object
 * 
 * @returns {Promise<void>} 201 Created with { message: "Notification set", id: <notificationId> }
 */
export const setNotification = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId, message, trigger } = req.body as NotificationInput;

    const db: FirebaseFirestore.Firestore = admin.firestore();

    const docRef: FirebaseFirestore.DocumentReference = await db.collection("notifications").add({
      userId,
      message,
      trigger,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });

    res.status(201).json({ message: "Notification set", id: docRef.id });
  } catch {
    res.status(500).json({ error: "Failed to set notification" });
  }
}; 

/**
 * @route DELETE /notifications/:id
 * @group Notifications - User-triggered stock alerts and preferences
 * @description Remove a previously set user-specific notification.
 * @access Investor
 * 
 * @param {Request} req - Express request object with notification ID in URL
 * @param {Response} res - Express response object
 * 
 * @returns {Promise<void>} 200 OK with { message: "Notification deleted" }
 */
export const deleteNotification = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const db: FirebaseFirestore.Firestore = admin.firestore();

    await db.collection("notifications").doc(id).delete();

    res.status(200).json({ message: "Notification deleted" });
  } catch {
    res.status(500).json({ error: "Failed to delete notification" });
  }
};
