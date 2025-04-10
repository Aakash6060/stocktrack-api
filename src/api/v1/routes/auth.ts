import { Router } from "express";
import { registerUser, loginUser, setUserRole, listUsers, getUserById } from "../controllers/authController";
import { verifyRole, verifySelfOrAdmin } from "../../../middleware/auth";

const router: Router = Router();

/**
 * @swagger
 * /auth/register:
 *   post:
 *     tags:
 *       - Auth
 *     description: Register a new user
 *     parameters:
 *       - in: body
 *         name: user
 *         description: The user information to register
 *         required: true
 *         schema:
 *           type: object
 *           required:
 *             - email
 *             - password
 *           properties:
 *             email:
 *               type: string
 *               example: "test@example.com"
 *             password:
 *               type: string
 *               example: "password123"
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 uid:
 *                   type: string
 *                   description: Unique user ID
 *                 email:
 *                   type: string
 *                   description: User email address
 *       500:
 *         description: Registration failed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Registration failed"
 *                 error:
 *                   type: object
 *                   properties:
 *                     code:
 *                       type: string
 *                       example: "auth/email-already-exists"
 *                     message:
 *                       type: string
 *                       example: "The email address is already in use by another account."
 */

router.post("/register", registerUser);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     tags:
 *       - Auth
 *     description: Login an existing user and return authentication tokens
 *     parameters:
 *       - in: body
 *         name: credentials
 *         description: The user's login credentials
 *         required: true
 *         schema:
 *           type: object
 *           required:
 *             - email
 *             - password
 *           properties:
 *             email:
 *               type: string
 *               example: "test@example.com"
 *             password:
 *               type: string
 *               example: "password123"
 *     responses:
 *       200:
 *         description: Successful login, returns the auth token and refresh token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 idToken:
 *                   type: string
 *                   description: Firebase authentication token used for authorizing API requests
 *                 refreshToken:
 *                   type: string
 *                   description: Firebase refresh token used for obtaining new `idToken` when it expires
 *       401:
 *         description: Invalid credentials (e.g., incorrect email/password)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Invalid credentials"
 */
router.post("/login", loginUser);

/**
 * @swagger
 * /auth/set-role:
 *   post:
 *     tags:
 *       - Auth
 *     description: Assign a custom role to a user (Admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: body
 *         name: data
 *         required: true
 *         description: User UID and role
 *         schema:
 *           type: object
 *           required:
 *             - uid
 *             - role
 *           properties:
 *             uid:
 *               type: string
 *               example: "uid_123"
 *             role:
 *               type: string
 *               example: "Investor"
 *     responses:
 *       200:
 *         description: Role set successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Server error
 */
router.post("/set-role", verifyRole(["Admin"]), setUserRole);

/**
 * @swagger
 * /users:
 *   get:
 *     tags:
 *       - Users
 *     description: List all users (Admin only)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Array of user profiles
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Server error
 */
router.get("/users", verifyRole(["Admin"]), listUsers);

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     tags:
 *       - Users
 *     description: Get user profile by ID (Admin or Owner only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: User ID to fetch
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User profile details
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: User not found
 */
router.get("/users/:id", verifySelfOrAdmin, getUserById);
export default router;
