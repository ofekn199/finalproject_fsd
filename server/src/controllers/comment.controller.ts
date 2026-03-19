import { NextFunction, Request, Response } from "express";
import { AuthRequest } from "../middlewares/auth.middleware";
import { createComment, getCommentsByPost } from "../services/comment.service";

/**
 * createCommentHandler
 *
 * Creates a new comment under a specific post.
 * Requires authentication (user must be logged in).
 *
 * Flow:
 * 1. Validate user from auth middleware
 * 2. Extract postId from params
 * 3. Extract text from body
 * 4. Call service to create comment
 * 5. Return created comment
 */
export async function createCommentHandler(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    // Ensure user is authenticated
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // TypeScript fix: force params.id to be string
    const postId = req.params.id as string;

    // Extract comment text from request body
    const { text } = req.body;

    // Call service to create comment
    const comment = await createComment(postId, req.user.id, text);

    // Return created comment
    res.status(201).json(comment);
  } catch (err) {
    next(err);
  }
}

/**
 * getCommentsHandler
 *
 * Returns all comments for a given post.
 *
 * Flow:
 * 1. Extract postId from params
 * 2. Fetch comments from DB
 * 3. Return list sorted by newest first
 */
export async function getCommentsHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    // TypeScript fix: force params.id to be string
    const postId = req.params.id as string;

    // Fetch comments from service
    const comments = await getCommentsByPost(postId);

    // Return comments
    res.json(comments);
  } catch (err) {
    next(err);
  }
}