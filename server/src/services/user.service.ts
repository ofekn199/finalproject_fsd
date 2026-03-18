import fs from "fs";
import path from "path";
import { User } from "../models/user.model";

/**
 * User service — handles profile reads and updates.
 * Sensitive fields (password, refreshToken, googleId) are always excluded
 * from responses using .select() so they never reach the client.
 */

// Returns public profile data for any user by their MongoDB _id
export async function getUserById(userId: string) {
  const user = await User.findById(userId).select("-password -refreshToken -googleId");
  if (!user) {
    throw { status: 404, message: "User not found" };
  }
  return user;
}

// Updates the logged-in user's bio and/or username
// { new: true } returns the updated document instead of the old one
export async function updateUserProfile(userId: string, fields: { bio?: string; username?: string }) {
  // If changing username, check it isn't already taken by another user
  if (fields.username) {
    const existing = await User.findOne({ username: fields.username });
    if (existing && existing._id.toString() !== userId) {
      throw { status: 409, message: "Username already taken" };
    }
  }

  const update: { bio?: string; username?: string } = {};
  if (fields.bio !== undefined) update.bio = fields.bio;
  if (fields.username !== undefined) update.username = fields.username;

  const user = await User.findByIdAndUpdate(
    userId,
    update,
    { new: true, runValidators: true }
  ).select("-password -refreshToken -googleId");

  if (!user) {
    throw { status: 404, message: "User not found" };
  }
  return user;
}

// Replaces the user's avatar image:
// 1. Deletes the old file from disk using async unlink (non-blocking, non-critical)
// 2. Saves the new filename as a /uploads/... path in the database
export async function updateUserAvatar(userId: string, filename: string) {
  const user = await User.findById(userId);
  if (!user) {
    throw { status: 404, message: "User not found" };
  }

  // Clean up old avatar file from disk if it exists
  if (user.profilePicture) {
    const oldPath = path.join(process.cwd(), "uploads", path.basename(user.profilePicture));
    try {
      await fs.promises.unlink(oldPath);
    } catch {
      // non-critical — file may already be gone
    }
  }

  // Save the new path — Express serves /uploads statically so the client can fetch it
  user.profilePicture = `/uploads/${filename}`;
  await user.save();

  return user;
}
