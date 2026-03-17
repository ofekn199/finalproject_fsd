/**
 * Post Service — Business logic for post CRUD and feed.
 *
 * Responsibilities:
 * - Create, read, update, delete posts
 * - Feed pagination (returns structured { items, page, limit, hasMore })
 * - Ownership enforcement (throws 403 if non-owner tries to mutate)
 * - File cleanup (deletes old image from disk when post is deleted)
 */

import fs from "fs";
import path from "path";
import mongoose from "mongoose";
import { Post, IPost } from "../models/post.model";

// ── Types ────────────────────────────────────────────────────────────────────

export interface FeedResult {
  items: IPost[];
  page: number;
  limit: number;
  hasMore: boolean;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Deletes an uploaded image file from disk.
 * Silently ignores errors (e.g. file already deleted).
 */
function deleteImageFile(imageUrl: string): void {
  try {
    // imageUrl is stored as "/uploads/filename.jpg" — strip the leading slash
    const filename = imageUrl.replace(/^\/uploads\//, "");
    const filePath = path.resolve("uploads", filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch {
    // Non-critical — log but don't fail the request
    console.warn("Could not delete post image:", imageUrl);
  }
}

// ── Service functions ────────────────────────────────────────────────────────

/**
 * Creates a new post.
 * @param authorId  — MongoDB ObjectId of the logged-in user
 * @param text      — Post body text
 * @param imageUrl  — Optional path returned by multer (e.g. "/uploads/file.jpg")
 */
export async function createPost(
  authorId: string,
  text: string,
  imageUrl?: string
): Promise<IPost> {
  const post = await Post.create({ author: authorId, text, imageUrl });
  return post.populate("author", "username profilePicture");
}

/**
 * Returns a paginated feed of all posts, newest first.
 * The author field is populated with username and profilePicture.
 */
export async function getFeed(page: number, limit: number): Promise<FeedResult> {
  const skip = (page - 1) * limit;

  const [items, total] = await Promise.all([
    Post.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("author", "username profilePicture"),
    Post.countDocuments(),
  ]);

  return {
    items,
    page,
    limit,
    hasMore: skip + items.length < total,
  };
}

/**
 * Returns a single post by ID.
 * Returns null if not found — the controller sends the 404.
 */
export async function getPostById(id: string): Promise<IPost | null> {
  return Post.findById(id).populate("author", "username profilePicture");
}

/**
 * Updates the text of a post.
 * Throws 403 if the requesting user is not the post author.
 * Throws 404 if the post doesn't exist.
 */
export async function updatePost(
  postId: string,
  requesterId: string,
  text: string
): Promise<IPost> {
  const post = await Post.findById(postId);
  if (!post) throw { status: 404, message: "Post not found" };
  if (post.author.toString() !== requesterId) {
    throw { status: 403, message: "Not authorized to edit this post" };
  }
  post.text = text;
  await post.save();
  return post.populate("author", "username profilePicture");
}

/**
 * Deletes a post and its associated image file from disk.
 * Throws 403 if the requesting user is not the post author.
 * Throws 404 if the post doesn't exist.
 */
export async function deletePost(
  postId: string,
  requesterId: string
): Promise<void> {
  const post = await Post.findById(postId);
  if (!post) throw { status: 404, message: "Post not found" };
  if (post.author.toString() !== requesterId) {
    throw { status: 403, message: "Not authorized to delete this post" };
  }
  // Clean up image from disk before removing the DB record
  if (post.imageUrl) {
    deleteImageFile(post.imageUrl);
  }
  await post.deleteOne();
}

/**
 * Returns all posts by a specific user (for the profile page).
 * Sorted newest first, no pagination (profile pages show all user posts).
 */
export async function getPostsByUser(userId: string): Promise<IPost[]> {
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw { status: 400, message: "Invalid user ID" };
  }
  return Post.find({ author: userId })
    .sort({ createdAt: -1 })
    .populate("author", "username profilePicture");
}
