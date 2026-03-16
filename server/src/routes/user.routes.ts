import { Router } from "express";
import { getProfile, updateProfile, uploadAvatar } from "../controllers/user.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import upload from "../utils/multer";


export const userRouter = Router();

/**
 * @openapi
 * /users/{id}:
 *   get:
 *     summary: Get user public profile
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: User profile returned
 *       404:
 *         description: User not found
 */
userRouter.get("/:id", getProfile);

/**
 * @openapi
 * /users/me:
 *   put:
 *     summary: Update current user's bio
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               bio:
 *                 type: string
 *                 example: Esports enthusiast 🎮
 *     responses:
 *       200:
 *         description: Updated user profile
 *       401:
 *         description: Unauthorized
 */
userRouter.put("/me", authMiddleware, updateProfile);

/**
 * @openapi
 * /users/me/avatar:
 *   post:
 *     summary: Upload profile picture
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               avatar:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Avatar uploaded, returns profilePicture URL
 *       400:
 *         description: No image provided
 *       401:
 *         description: Unauthorized
 */
userRouter.post("/me/avatar", authMiddleware, upload.single("avatar"), uploadAvatar);
