import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { analyzeChessPosition } from "../services/chess-ai.service";

const analyzeChessSchema = z.object({
  body: z.object({
    fen: z.string().trim().min(1, "FEN is required"),
  }),
});

/**
 * POST /ai/analyze-chess
 * Analyze a chess position from FEN using Stockfish.
 */
export async function analyzeChess(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const parsed = analyzeChessSchema.parse({ body: req.body });

    const result = await analyzeChessPosition({
      fen: parsed.body.fen,
    });

    res.json(result);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ message: "Validation failed" });
    }

    next(err);
  }
}