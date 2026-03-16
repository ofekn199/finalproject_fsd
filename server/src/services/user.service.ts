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

// Updates only the bio field of the logged-in user
// { new: true } returns the updated document instead of the old one
export async function updateUserProfile(userId: string, bio: string) {
  const user = await User.findByIdAndUpdate(
    userId,
    { bio },
    { new: true, runValidators: true }
  ).select("-password -refreshToken -googleId");

  if (!user) {
    throw { status: 404, message: "User not found" };
  }
  return user;
}

// Replaces the user's avatar image:
// 1. Deletes the old file from disk (to avoid orphaned files filling up storage)
// 2. Saves the new filename as a /uploads/... path in the database
export async function updateUserAvatar(userId: string, filename: string) {
  const user = await User.findById(userId);
  if (!user) {
    throw { status: 404, message: "User not found" };
  }

  // Clean up old avatar file from disk if it exists
  if (user.profilePicture) {
    const oldPath = path.join(process.cwd(), "uploads", path.basename(user.profilePicture));
    if (fs.existsSync(oldPath)) {
      fs.unlinkSync(oldPath);
    }
  }

  // Save the new path — Express serves /uploads statically so the client can fetch it
  user.profilePicture = `/uploads/${filename}`;
  await user.save();

  return user;
}
