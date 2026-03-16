import { Response, NextFunction } from "express";
import { AuthRequest } from "../middlewares/auth.middleware";
import { getUserById, updateUserProfile, updateUserAvatar } from "../services/user.service";

/**
 * User controller — handles HTTP for user profile endpoints.
 * req.user is injected by authMiddleware when a Bearer token is present.
 */

// GET /users/:id — returns public profile (no auth required)
export async function getProfile(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const user = await getUserById(id);
    res.json(user);
  } catch (err) {
    next(err);
  }
}

// PUT /users/me — updates the logged-in user's bio (auth required)
export async function updateProfile(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });

    const { bio } = req.body;
    const user = await updateUserProfile(req.user.id, bio ?? "");
    res.json(user);
  } catch (err) {
    next(err);
  }
}

// POST /users/me/avatar — saves uploaded image as profile picture (auth required)
// req.file is populated by multer middleware before this function runs
export async function uploadAvatar(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });
    if (!req.file) return res.status(400).json({ message: "No image file provided" });

    const user = await updateUserAvatar(req.user.id, req.file.filename);
    res.json({ profilePicture: user.profilePicture });
  } catch (err) {
    next(err);
  }
}
