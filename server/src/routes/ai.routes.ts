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
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 summary:
 *                   type: string
 *                 insight:
 *                   type: string
 *                 suggestion:
 *                   type: string
 *       400:
 *         description: Invalid request body
 *       500:
 *         description: AI analysis failed
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
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 bestMove:
 *                   type: string
 *                 evaluation:
 *                   type: string
 *                 line:
 *                   type: array
 *                   items:
 *                     type: string
 *       400:
 *         description: Invalid FEN or request body
 *       500:
 *         description: Chess engine failed
 */
aiRouter.post("/analyze-chess", analyzeChess);