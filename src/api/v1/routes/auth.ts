import { Router } from "express";
import { registerUser } from "../controllers/authController";
import { loginUser } from "../controllers/authController";

const router = Router();

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

export default router;
