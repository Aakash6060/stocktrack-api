import { Request, Response } from "express";
import admin from "../../../config/firebase";

/**
 * @route GET /analytics/market
 * @description View overall stock market performance.
 * @access Analyst
 * 
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * 
 * @returns {Promise<void>} List of market performance data
 */
export const getMarketPerformance = async (req: Request, res: Response): Promise<void> => {
  try {
    const db: FirebaseFirestore.Firestore = admin.firestore();
    const snapshot = await db.collection("marketPerformance").get();

    const data = snapshot.docs.map(doc => doc.data());

    res.status(200).json({ data });
  } catch {
    res.status(500).json({ error: "Failed to retrieve market performance" });
  }
};

/**
 * @route GET /analytics/sector/:sector
 * @description Get insights on a specific sector.
 * @access Analyst
 * 
 * @param {Request} req - Express request with sector param
 * @param {Response} res - Express response object
 * 
 * @returns {Promise<void>} Sector insight data
 */
export const getSectorInsights = async (req: Request, res: Response): Promise<void> => {
    try {
      const { sector } = req.params;
      const db: FirebaseFirestore.Firestore = admin.firestore();
  
      const snapshot = await db.collection("sectors").doc(sector).get();
  
      if (!snapshot.exists) {
        res.status(404).json({ message: "Sector data not found" });
        return;
      }
  
      res.status(200).json({ insights: snapshot.data() });
    } catch {
      res.status(500).json({ error: "Failed to retrieve sector insights" });
    }
  };  

/**
 * @route GET /analytics/top-movers
 * @description Retrieve top gaining and losing stocks.
 * @access Analyst
 * 
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * 
 * @returns {Promise<void>} Top gainers and losers
 */
export const getTopMovers = async (req: Request, res: Response): Promise<void> => {
    try {
      const db: FirebaseFirestore.Firestore = admin.firestore();
  
      const gainersSnap = await db.collection("topMovers").doc("gainers").get();
      const losersSnap = await db.collection("topMovers").doc("losers").get();
  
      res.status(200).json({
        topGainers: gainersSnap.data(),
        topLosers: losersSnap.data()
      });
    } catch {
      res.status(500).json({ error: "Failed to fetch top movers" });
    }
  };

/**
 * @route GET /analytics/user-trends
 * @description Analyze user portfolio trends.
 * @access Admin
 * 
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * 
 * @returns {Promise<void>} User trend analytics
 */
export const getUserTrends = async (req: Request, res: Response): Promise<void> => {
    try {
      const db: FirebaseFirestore.Firestore = admin.firestore();
      const trendsSnapshot = await db.collection("userTrends").get();
  
      const trends = trendsSnapshot.docs.map(doc => doc.data());
  
      res.status(200).json({ trends });
    } catch {
      res.status(500).json({ error: "Failed to fetch user trends" });
    }
  };

/**
 * @route POST /notifications
 * @description Set user-specific notifications.
 * @access Investor
 * 
 * @param {Request} req - Express request with userId, message, and trigger
 * @param {Response} res - Express response object
 * 
 * @returns {Promise<void>} Confirmation message
 */
export const setNotification = async (req: Request, res: Response): Promise<void> => {
    try {
      const { userId, message, trigger } = req.body;
      const db: FirebaseFirestore.Firestore = admin.firestore();
  
      const docRef = await db.collection("notifications").add({
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
 * @description Remove a user-specific notification.
 * @access Investor
 * 
 * @param {Request} req - Express request with notification ID
 * @param {Response} res - Express response object
 * 
 * @returns {Promise<void>} Deletion status
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