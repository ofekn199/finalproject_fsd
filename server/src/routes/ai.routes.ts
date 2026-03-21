import { Router } from "express";
import { analyzePost } from "../controllers/ai.controller";
import { analyzeChess } from "../controllers/chess-ai.controller";

export const aiRouter = Router();

/**
 * @openapi
 * /ai/analyze-post:
 *   post:
 *     summary: Analyze a post with AI
 *     tags: [AI]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - text
 *             properties:
 *               text:
 *                 type: string
 *                 example: White to play and win. What is the best move?
 *               imageUrl:
 *                 type: string
 *                 example: /uploads/chess-position.png
 *     responses:
 *       200:
 *         description: AI analysis result
 */
aiRouter.post("/analyze-post", analyzePost);

/**
 * @openapi
 * /ai/analyze-chess:
 *   post:
 *     summary: Analyze a chess position from FEN
 *     tags: [AI]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - fen
 *             properties:
 *               fen:
 *                 type: string
 *                 example: 8/7b/P1k5/3N4/8/8/5PKp/8 w - - 0 1
 *     responses:
 *       200:
 *         description: Chess analysis result
 */
aiRouter.post("/analyze-chess", analyzeChess);