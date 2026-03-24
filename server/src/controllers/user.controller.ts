import { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import { AuthRequest } from "../middlewares/auth.middleware";
import {
  getUserById,
  updateUserProfile,
  updateUserAvatar,
} from "../services/user.service";
import {
  getLikedPostsByUser,
  getCommentedPostsByUser,
} from "../services/user-relations.service";

/**
 * User controller — handles HTTP for user profile endpoints.
 * req.user is injected by authMiddleware when a Bearer token is present.
 */

// GET /users/:id — returns public profile (no auth required)
export async function getProfile(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const id = req.params.id as string;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const user = await getUserById(id);
    res.json(user);
  } catch (err) {
    next(err);
  }
}

// PUT /users/me — updates the logged-in user's bio and/or username (auth required)
export async function updateProfile(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { bio, username } = req.body;
    const user = await updateUserProfile(req.user.id, { bio, username });
    res.json(user);
  } catch (err) {
    next(err);
  }
}

// POST /users/me/avatar — saves uploaded image as profile picture (auth required)
// req.file is populated by multer middleware before this function runs
export async function uploadAvatar(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!req.file) {
      return res.status(400).json({ message: "No image file provided" });
    }

    const user = await updateUserAvatar(req.user.id, req.file.filename);
    res.json({ profilePicture: user.profilePicture });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /users/:id/liked-posts
 * Returns posts liked by a specific user.
 */
export async function getLikedPostsByUserHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.params.id as string;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const posts = await getLikedPostsByUser(userId);
    res.json(posts);
  } catch (err) {
    next(err);
  }
}

/**
 * GET /users/:id/commented-posts
 * Returns posts that the user has commented on.
 */
export async function getCommentedPostsByUserHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.params.id as string;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const posts = await getCommentedPostsByUser(userId);
    res.json(posts);
  } catch (err) {
    next(err);
  }
}