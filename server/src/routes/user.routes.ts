import { Router } from "express";
import { getProfile, updateProfile, uploadAvatar } from "../controllers/user.controller";
import { getPostsByUser } from "../controllers/post.controller";
import { authMiddleware, optionalAuthMiddleware } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate.middleware";
import { updateProfileSchema } from "../utils/auth.schemas";
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
userRouter.put("/me", authMiddleware, validate(updateProfileSchema), updateProfile);

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

/**
 * @openapi
 * /users/{id}/posts:
 *   get:
 *     summary: Get all posts by a specific user
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
 *         description: Array of posts by the user (newest first)
 *       400:
 *         description: Invalid user ID format
 */
// optionalAuth — public, but includes isLikedByUser when token is present
userRouter.get("/:id/posts", optionalAuthMiddleware, getPostsByUser);
