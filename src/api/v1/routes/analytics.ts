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
 *     description: View overall stock market performance
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Market performance data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 marketIndex:
 *                   type: number
 *                 changePercentage:
 *                   type: number
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Unauthorized access"
 *       403:
 *         description: Forbidden
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Insufficient permissions"
 *       500:
 *         description: Internal server error
 */
router.get("/market", verifyRole(["Analyst"]), getMarketPerformance);

/**
 * @swagger
 * /analytics/sector/{sector}:
 *   get:
 *     tags:
 *       - Analytics
 *     description: Get insights on a specific sector
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: sector
 *         required: true
 *         description: Sector name
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Sector insights data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 sector:
 *                   type: string
 *                 performance:
 *                   type: number
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Unauthorized access"
 *       403:
 *         description: Forbidden
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Insufficient permissions"
 *       404:
 *         description: Sector not found
 *       500:
 *         description: Internal server error
 */
router.get("/sector/:sector", verifyRole(["Analyst"]), getSectorInsights);

/**
 * @swagger
 * /analytics/top-movers:
 *   get:
 *     tags:
 *       - Analytics
 *     description: Retrieve top gaining and losing stocks
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Top movers data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 gainers:
 *                   type: array
 *                   items:
 *                     type: object
 *                 losers:
 *                   type: array
 *                   items:
 *                     type: object
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Unauthorized access"
 *       403:
 *         description: Forbidden
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Insufficient permissions"
 *       500:
 *         description: Internal server error
 */
router.get("/top-movers", verifyRole(["Analyst"]), getTopMovers);

/**
 * @swagger
 * /analytics/user-trends:
 *   get:
 *     tags:
 *       - Analytics
 *     description: Analyze user portfolio trends
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User trend analytics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 trends:
 *                   type: array
 *                   items:
 *                     type: object
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Unauthorized access"
 *       403:
 *         description: Forbidden
 */
router.get("/user-trends", verifyRole(["Admin"]), getUserTrends);

/**
 * @swagger
 * /notifications:
 *   post:
 *     tags:
 *       - Notifications
 *     description: Set user-specific notifications
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: body
 *         name: notification
 *         required: true
 *         schema:
 *           type: object
 *           required:
 *             - userId
 *             - message
 *             - trigger
 *           properties:
 *             userId:
 *               type: string
 *             message:
 *               type: string
 *             trigger:
 *               type: string
 *     responses:
 *       201:
 *         description: Notification set successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Internal server error
 */
router.post("/notifications", verifyRole(["Investor"]), setNotification);

/**
 * @swagger
 * /notifications/{id}:
 *   delete:
 *     tags:
 *       - Notifications
 *     description: Remove a user-specific notification
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Notification deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Internal server error
 */
router.delete("/notifications/:id", verifyRole(["Investor"]), deleteNotification);

export default router;