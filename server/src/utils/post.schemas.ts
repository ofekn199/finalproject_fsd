/**
 * Post validation schemas (Zod)
 *
 * Each schema validates request data before it reaches the controller.
 * The validate() middleware parses:
 * - body
 * - query
 * - params
 *
 * Current phase:
 * - createPostSchema → POST /posts
 * - getPostsSchema   → GET /posts
 *
 * Future phase:
 * - updatePostSchema → PUT /posts/:id
 * - postIdSchema     → GET /posts/:id, DELETE /posts/:id
 */

import { z } from "zod";

/**
 * POST /posts
 * A post must include text content.
 * imageUrl is optional for now.
 * Later, when using multer, the uploaded file will be handled separately.
 */
export const createPostSchema = z.object({
  body: z.object({
    text: z
      .string()
      .trim()
      .min(1, "Text cannot be empty")
      .max(500, "Text cannot exceed 500 characters"),
    imageUrl: z.string().optional(),
  }),
});

/**
 * GET /posts
 * page and limit arrive as strings in query params.
 * They are converted to numbers later inside the controller.
 */
export const getPostsSchema = z.object({
  query: z.object({
    page: z.string().optional(),
    limit: z.string().optional(),
  }),
});

/**
 * FUTURE: PUT /posts/:id
 * Keep this schema for the next phase when edit post is implemented.
 */
export const updatePostSchema = z.object({
  body: z.object({
    text: z
      .string()
      .trim()
      .min(1, "Text cannot be empty")
      .max(500, "Text cannot exceed 500 characters"),
    removeImage: z.literal("true").optional(),
  }),
  params: z.object({
    id: z.string().min(1, "Post id is required"),
  }),
});

/**
 * FUTURE: GET /posts/:id or DELETE /posts/:id
 */
export const postIdSchema = z.object({
  params: z.object({
    id: z.string().min(1, "Post id is required"),
  }),
});