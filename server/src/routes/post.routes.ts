import { Router } from "express";
import { authMiddleware, optionalAuthMiddleware } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate.middleware";
import upload from "../utils/multer";
import { createPost, getFeed, getPostById, updatePost, deletePost } from "../controllers/post.controller";
import { toggleLike } from "../controllers/like.controller";
import { createPostSchema, updatePostSchema, postIdSchema, getPostsSchema } from "../utils/post.schemas";

export const postRouter = Router();

/**
 * @openapi
 * /posts:
 *   post:
 *     summary: Create a new post
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [text]
 *             properties:
 *               text:
 *                 type: string
 *                 maxLength: 500
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Post created
 *       400:
 *         description: Validation failed
 *       401:
 *         description: Unauthorized
 */
// auth required — multer handles the optional image, validate checks the text
postRouter.post("/", authMiddleware, upload.single("image"), validate(createPostSchema), createPost);

/**
 * @openapi
 * /posts:
 *   get:
 *     summary: Get paginated feed (newest first)
 *     tags: [Posts]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *       - in: query
 *         name: userId
 *         schema: { type: string }
 *         description: Filter posts by author ID
 *     responses:
 *       200:
 *         description: Returns { items, page, limit, hasMore }
 */
// optionalAuth — public feed, but isLikedByUser is included when a token is present
postRouter.get("/", optionalAuthMiddleware, validate(getPostsSchema), getFeed);

/**
 * @openapi
 * /posts/{id}:
 *   get:
 *     summary: Get a single post by ID
 *     tags: [Posts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Post returned
 *       400:
 *         description: Invalid ID format
 *       404:
 *         description: Post not found
 */
// optionalAuth — public, but isLikedByUser is included when a token is present
postRouter.get("/:id", optionalAuthMiddleware, validate(postIdSchema), getPostById);

/**
 * @openapi
 * /posts/{id}:
 *   put:
 *     summary: Edit a post (owner only)
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [text]
 *             properties:
 *               text:
 *                 type: string
 *                 maxLength: 500
 *               image:
 *                 type: string
 *                 format: binary
 *               removeImage:
 *                 type: string
 *                 enum: ["true"]
 *     responses:
 *       200:
 *         description: Updated post
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Not the post owner
 *       404:
 *         description: Post not found
 */
// auth required — multer handles the optional image, service enforces that only the author can edit
postRouter.put("/:id", authMiddleware, upload.single("image"), validate(updatePostSchema), updatePost);

/**
 * @openapi
 * /posts/{id}:
 *   delete:
 *     summary: Delete a post (owner only)
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Post deleted
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Not the post owner
 *       404:
 *         description: Post not found
 */
// auth required — service enforces that only the author can delete
postRouter.delete("/:id", authMiddleware, validate(postIdSchema), deletePost);

// POST /posts/:id/like — toggles like on/off for the authenticated user
postRouter.post("/:id/like", authMiddleware, toggleLike);
