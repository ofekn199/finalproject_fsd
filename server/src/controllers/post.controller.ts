import { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import { AuthRequest } from "../middlewares/auth.middleware";
import * as postService from "../services/post.service";

/**
 * Post controller — thin layer between HTTP and the post service.
 * Responsibilities: extract request data, call the service, send the response.
 * All errors are forwarded to next() and handled by errorMiddleware.
 */

// POST /posts — creates a new post, image upload is optional (handled by multer)
export async function createPost(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { text } = req.body;
    const authorId = req.user!.id;
    // req.file is set by multer if the user attached an image
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : undefined;

    const post = await postService.createPost(authorId, text, imageUrl);
    res.status(201).json(post);
  } catch (err) {
    next(err);
  }
}

// GET /posts — returns paginated posts, newest first
// Optional query params: page (default 1), limit (default 10), userId (filter by author)
export async function getFeed(req: Request, res: Response, next: NextFunction) {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string) || 10));
    const userId = req.query.userId as string | undefined;

    const result = await postService.getFeed(page, limit, userId);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

// GET /posts/:id — returns a single post by its MongoDB ID
export async function getPostById(req: Request, res: Response, next: NextFunction) {
  try {
    const id = req.params.id as string;

    // Validate the ID format before hitting the database
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid post ID" });
    }

    const post = await postService.getPostById(id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    res.json(post);
  } catch (err) {
    next(err);
  }
}

// PUT /posts/:id — updates the post text and/or image, only the owner can do this
// The service throws 403 if req.user is not the post author
export async function updatePost(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const id = req.params.id as string;
    const { text, removeImage } = req.body;

    // Determine image change intent:
    //   new file uploaded → replace
    //   removeImage="true" → remove
    //   neither           → leave unchanged (undefined)
    const imageUrl = req.file
      ? `/uploads/${req.file.filename}`
      : removeImage === "true"
        ? null
        : undefined;

    const updated = await postService.updatePost(id, req.user!.id, text, imageUrl);
    res.json(updated);
  } catch (err) {
    next(err);
  }
}

// DELETE /posts/:id — deletes the post and its image file, only the owner can do this
// The service throws 403 if req.user is not the post author
export async function deletePost(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const id = req.params.id as string;

    await postService.deletePost(id, req.user!.id);
    res.json({ message: "Post deleted" });
  } catch (err) {
    next(err);
  }
}

// GET /users/:id/posts — returns all posts by a specific user (profile page)
// Reuses getFeed with a userId filter — validates the ID format first
export async function getPostsByUser(req: Request, res: Response, next: NextFunction) {
  try {
    const id = req.params.id as string;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const result = await postService.getFeed(1, 1000, id);
    res.json(result.items);
  } catch (err) {
    next(err);
  }
}
