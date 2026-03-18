/**
 * Post Validation Schemas (Zod)
 *
 * Each schema validates { body, query, params } for a specific endpoint.
 * Passed to the validate() middleware before the controller runs.
 *
 * createPostSchema  → POST /posts
 * updatePostSchema  → PUT  /posts/:id
 * postIdSchema      → GET/DELETE /posts/:id
 * feedQuerySchema   → GET /posts
 */

import { z } from "zod";

// POST /posts — body must have text (1–500 chars); image is handled by multer, not validated here
export const createPostSchema = z.object({
  body: z.object({
    text: z
      .string({ error: "text is required" })
      .trim()
      .min(1, "text cannot be empty")
      .max(500, "text cannot exceed 500 characters"),
  }),
});

// PUT /posts/:id — same text rules + params.id must be a non-empty string
// removeImage is an optional form field ("true") to remove the existing image
export const updatePostSchema = z.object({
  body: z.object({
    text: z
      .string({ error: "text is required" })
      .trim()
      .min(1, "text cannot be empty")
      .max(500, "text cannot exceed 500 characters"),
    removeImage: z.string().optional(),
  }),
  params: z.object({
    id: z.string().min(1),
  }),
});

// GET/DELETE /posts/:id — just validates that :id is present
export const postIdSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
});

// GET /posts — optional pagination + optional userId filter (all parsed as strings in controller)
export const feedQuerySchema = z.object({
  query: z.object({
    page: z.string().optional(),
    limit: z.string().optional(),
    userId: z.string().optional(),
  }),
});
