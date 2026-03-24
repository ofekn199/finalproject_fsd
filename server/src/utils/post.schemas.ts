/**
 * Post validation schemas (Zod)
 *
 * Each schema validates request data before it reaches the controller.
 * The validate() middleware parses:
 * - body
 * - query
 * - params
 */

import { z } from "zod";

/**
 * POST /posts
 * A post must include text content.
 * imageUrl is optional for now.
 * fen is optional and is used for chess-related posts.
 */
export const createPostSchema = z.object({
  body: z.object({
    text: z
      .string()
      .trim()
      .min(1, "Text cannot be empty")
      .max(500, "Text cannot exceed 500 characters"),
    imageUrl: z.string().optional(),
    fen: z
      .string()
      .trim()
      .max(200, "FEN cannot exceed 200 characters")
      .optional()
      .or(z.literal("")),
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
 * PUT /posts/:id
 * Supports text update, optional image removal/replacement, and optional FEN.
 */
export const updatePostSchema = z.object({
  body: z.object({
    text: z
      .string()
      .trim()
      .min(1, "Text cannot be empty")
      .max(500, "Text cannot exceed 500 characters"),
    removeImage: z.literal("true").optional(),
    fen: z
      .string()
      .trim()
      .max(200, "FEN cannot exceed 200 characters")
      .optional()
      .or(z.literal("")),
  }),
  params: z.object({
    id: z.string().min(1, "Post id is required"),
  }),
});

/**
 * GET /posts/:id or DELETE /posts/:id
 */
export const postIdSchema = z.object({
  params: z.object({
    id: z.string().min(1, "Post id is required"),
  }),
});