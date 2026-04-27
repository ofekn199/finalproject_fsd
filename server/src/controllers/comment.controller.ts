import { NextFunction, Request, Response } from "express";
import mongoose from "mongoose";
import { AuthRequest } from "../middlewares/auth.middleware";
import { createComment, getCommentsByPost } from "../services/comment.service";

/**
 * createCommentHandler
 *
 * Creates a new comment under a specific post.
 * Requires authentication.
 */
export async function createCommentHandler(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const postId = req.params.id as string;

    if (!mongoose.Types.ObjectId.isValid(postId)) {
      return res.status(400).json({ message: "Invalid post ID" });
    }

    const { text } = req.body;

    const comment = await createComment(postId, req.user.id, text);

    res.status(201).json(comment);
  } catch (err) {
    next(err);
  }
}

/**
 * getCommentsHandler
 *
 * Returns all comments for a specific post, sorted by newest first.
 */
export async function getCommentsHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const postId = req.params.id as string;

    if (!mongoose.Types.ObjectId.isValid(postId)) {
      return res.status(400).json({ message: "Invalid post ID" });
    }

    const comments = await getCommentsByPost(postId);

    res.json(comments);
  } catch (err) {
    next(err);
  }
}