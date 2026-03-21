import { Router } from "express";
import { analyzePost } from "../controllers/ai.controller";

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