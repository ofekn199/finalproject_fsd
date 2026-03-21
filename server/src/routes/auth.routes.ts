import { Router } from "express";
import { register, login, refresh, logout, googleLogin } from "../controllers/auth.controller";
import { validate } from "../middlewares/validate.middleware";
import { registerSchema, loginSchema, refreshSchema, googleLoginSchema } from "../utils/auth.schemas";
import { authMiddleware } from "../middlewares/auth.middleware";

export const authRouter = Router();

/**
 * @openapi
 * /auth/register:
 *   post:
 *     summary: Register new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [username, email, password]
 *             properties:
 *               username:
 *                 type: string
 *                 example: ofek1
 *               email:
 *                 type: string
 *                 example: ofek1@test.com
 *               password:
 *                 type: string
 *                 example: Pass1234!
 *     responses:
 *       201:
 *         description: User created
 *       400:
 *         description: Validation failed
 *       409:
 *         description: Username or email already exists
 */
authRouter.post("/register", validate(registerSchema), register);

/**
 * @openapi
 * /auth/login:
 *   post:
 *     summary: Login user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [username, password]
 *             properties:
 *               username:
 *                 type: string
 *                 example: ofek1
 *               password:
 *                 type: string
 *                 example: Pass1234!
 *     responses:
 *       200:
 *         description: Tokens returned
 *       400:
 *         description: Validation failed
 *       401:
 *         description: Invalid credentials
 */
authRouter.post("/login", validate(loginSchema), login);

/**
 * @openapi
 * /auth/refresh:
 *   post:
 *     summary: Refresh access token using refresh token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [refreshToken]
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 example: your_refresh_token
 *     responses:
 *       200:
 *         description: New tokens returned
 *       400:
 *         description: Validation failed
 *       401:
 *         description: Invalid refresh token
 */
authRouter.post("/refresh", validate(refreshSchema), refresh);

/**
 * @openapi
 * /auth/logout:
 *   post:
 *     summary: Logout user
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logged out
 *       401:
 *         description: Unauthorized
 */
authRouter.post("/logout", authMiddleware, logout);

/**
 * @openapi
 * /auth/google:
 *   post:
 *     summary: Login with Google
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [credential]
 *             properties:
 *               credential:
 *                 type: string
 *                 example: google_id_token
 *     responses:
 *       200:
 *         description: Tokens returned
 *       400:
 *         description: Validation failed or invalid Google credential
 *       401:
 *         description: Google authentication failed
 */
authRouter.post("/google", validate(googleLoginSchema), googleLogin);