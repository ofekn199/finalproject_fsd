import { Router } from "express";
import { register, login, refresh, logout } from "../controllers/auth.controller";

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
 */
authRouter.post("/register", register);

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
 */
authRouter.post("/login", login);

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
 */
authRouter.post("/refresh", refresh);

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
 */
authRouter.post("/logout", logout);