import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate.middleware";
import {
  createCommentHandler,
  getCommentsHandler,
} from "../controllers/comment.controller";
import {
  createCommentSchema,
  getCommentsSchema,
} from "../utils/comment.schemas";

export const commentRouter = Router();

/**
 * @openapi
 * /posts/{id}/comments:
 *   get:
 *     summary: Get comments for a post
 *     tags: [Comments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Post ID
 *     responses:
 *       200:
 *         description: Comments list
 *       400:
 *         description: Invalid post ID
 *       404:
 *         description: Post not found
 */
commentRouter.get(
  "/posts/:id/comments",
  validate(getCommentsSchema),
  getCommentsHandler
);

/**
 * @openapi
 * /posts/{id}/comments:
 *   post:
 *     summary: Add a comment to a post
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Post ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [text]
 *             properties:
 *               text:
 *                 type: string
 *                 example: This is my first comment
 *     responses:
 *       201:
 *         description: Comment created
 *       400:
 *         description: Validation failed or invalid post ID
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Post not found
 */
commentRouter.post(
  "/posts/:id/comments",
  authMiddleware,
  validate(createCommentSchema),
  createCommentHandler
);