import { Router } from "express";
import { getMarketPerformance, getSectorInsights, getTopMovers, getUserTrends, setNotification, deleteNotification} from "../controllers/analytics.controller";
import { verifyRole } from "../../../middleware/auth";

const router: Router = Router();

/**
 * @swagger
 * /analytics/market:
 *   get:
 *     tags:
 *       - Analytics
 *     summary: View overall stock market performance
 *     description: Retrieve index-level market performance data (e.g., growth, volume)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Market performance data retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                 source:
 *                   type: string
 *                   example: "CACHE"
 *       401:
 *         description: Unauthorized access
 *       403:
 *         description: Forbidden - insufficient permissions
 *       500:
 *         description: Server error while retrieving market data
 */
router.get("/market", verifyRole(["Analyst"]), getMarketPerformance);

/**
 * @swagger
 * /analytics/sector/{sector}:
 *   get:
 *     tags:
 *       - Analytics
 *     summary: Get insights on a specific sector
 *     description: Fetch data and performance metrics for a given sector like 'technology'
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: sector
 *         required: true
 *         description: Sector name (e.g., technology, healthcare)
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Sector insights returned
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 insights:
 *                   type: object
 *                 source:
 *                   type: string
 *       404:
 *         description: Sector not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Error retrieving sector data
 */
router.get("/sector/:sector", verifyRole(["Analyst"]), getSectorInsights);

/**
 * @swagger
 * /analytics/top-movers:
 *   get:
 *     tags:
 *       - Analytics
 *     summary: Retrieve top gaining and losing stocks
 *     description: Returns top-performing and worst-performing stocks of the day
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Top movers data retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 topGainers:
 *                   type: object
 *                 topLosers:
 *                   type: object
 *                 source:
 *                   type: string
 *                   example: "FIRESTORE"
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Server error while retrieving top movers
 */
router.get("/top-movers", verifyRole(["Analyst"]), getTopMovers);

/**
 * @swagger
 * /analytics/user-trends:
 *   get:
 *     tags:
 *       - Analytics
 *     summary: Analyze user portfolio trends
 *     description: Returns user behavior insights and trend analytics
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User trends fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 trends:
 *                   type: array
 *                   items:
 *                     type: object
 *                 source:
 *                   type: string
 *                   example: "CACHE"
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - admin access required
 *       500:
 *         description: Failed to retrieve user trend analytics
 */
router.get("/user-trends", verifyRole(["Admin"]), getUserTrends);

/**
 * @swagger
 * /notifications:
 *   post:
 *     tags:
 *       - Notifications
 *     summary: Set user-specific notification
 *     description: Allows investors to set personalized stock alerts based on a trigger condition
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - message
 *               - trigger
 *             properties:
 *               userId:
 *                 type: string
 *               message:
 *                 type: string
 *               trigger:
 *                 type: string
 *             example:
 *               userId: "abc123"
 *               message: "AAPL crossed $150"
 *               trigger: "AAPL > 150"
 *     responses:
 *       201:
 *         description: Notification created
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Internal error while creating notification
 */
router.post("/notifications", verifyRole(["Investor"]), setNotification);

/**
 * @swagger
 * /notifications/{id}:
 *   delete:
 *     tags:
 *       - Notifications
 *     summary: Delete a user notification
 *     description: Removes a user-set notification by its document ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the notification to delete
 *     responses:
 *       200:
 *         description: Notification deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Failed to delete the notification
 */
router.delete("/notifications/:id", verifyRole(["Investor"]), deleteNotification);

export default router;