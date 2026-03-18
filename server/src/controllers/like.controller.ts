import { Response, NextFunction } from "express";
import mongoose from "mongoose";
import { AuthRequest } from "../middlewares/auth.middleware";
import * as likeService from "../services/like.service";

// POST /posts/:id/like — toggles like on/off for the authenticated user
export async function toggleLike(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const id = req.params.id as string;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid post ID" });
    }

    const result = await likeService.toggleLike(id, req.user!.id);
    res.json(result);
  } catch (err) {
    next(err);
  }
}
