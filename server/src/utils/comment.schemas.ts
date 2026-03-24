import { z } from "zod";

/**
 * GET /posts/:id/comments
 */
export const getCommentsSchema = z.object({
  params: z.object({
    id: z.string().min(1, "Post id is required"),
  }),
});

/**
 * POST /posts/:id/comments
 */
export const createCommentSchema = z.object({
  params: z.object({
    id: z.string().min(1, "Post id is required"),
  }),
  body: z.object({
    text: z
      .string()
      .trim()
      .min(1, "Comment cannot be empty")
      .max(300, "Comment cannot exceed 300 characters"),
  }),
});