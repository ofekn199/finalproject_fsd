import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { analyzePostWithAI } from "../services/ai.service";

const analyzePostSchema = z.object({
  body: z.object({
    text: z
      .string()
      .trim()
      .min(1, "Post text is required")
      .max(2000, "Post text is too long"),
    imageUrl: z.string().optional(),
  }),
});

/**
 * POST /ai/analyze-post
 * Analyzes a post with AI and returns summary/insight/suggestion.
 */
export async function analyzePost(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const parsed = analyzePostSchema.parse({ body: req.body });
    const { text, imageUrl } = parsed.body;

    const result = await analyzePostWithAI({ text, imageUrl });
    res.json(result);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ message: "Validation failed" });
    }

    next(err);
  }
}