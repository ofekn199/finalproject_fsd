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
import { Post, IPost } from "../models/post.model";
import { Like } from "../models/like.model";

// ── Types ────────────────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface FeedResult {
  items: any[];
  page: number;
  limit: number;
  hasMore: boolean;
}

/** Batch-fetches which post IDs the given user has liked. Returns an empty set if no user. */
async function getLikedSet(
  requesterId: string | undefined,
  postIds: string[]
): Promise<Set<string>> {
  if (!requesterId || postIds.length === 0) return new Set();
  const likes = await Like.find({ user: requesterId, post: { $in: postIds } });
  return new Set(likes.map((l) => l.post.toString()));
}

// ── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Deletes an uploaded image file from disk.
 * Uses async fs.promises.unlink to avoid blocking the event loop.
 * Silently ignores errors (e.g. file already deleted, path mismatch).
 */
async function deleteImageFile(imageUrl: string): Promise<void> {
  try {
    const filename = imageUrl.replace(/^\/uploads\//, "");
    const uploadsDir = path.resolve("uploads");
    const filePath = path.resolve(uploadsDir, filename);

    if (!filePath.startsWith(uploadsDir + path.sep) && filePath !== uploadsDir) {
      console.warn("Blocked path traversal attempt:", imageUrl);
      return;
    }

    await fs.promises.unlink(filePath);
  } catch {
    console.warn("Could not delete post image:", imageUrl);
  }
}

// ── Service functions ────────────────────────────────────────────────────────

/**
 * Creates a new post.
 * @param authorId  — MongoDB ObjectId of the logged-in user
 * @param text      — Post body text
 * @param imageUrl  — Optional path returned by multer
 * @param fen       — Optional chess FEN string
 */
export async function createPost(
  authorId: string,
  text: string,
  imageUrl?: string,
  fen?: string
): Promise<IPost> {
  const post = await Post.create({
    author: authorId,
    text,
    imageUrl,
    fen: fen?.trim() || "",
  });

  return post.populate("author", "username profilePicture");
}

/**
 * Returns a paginated feed of posts, newest first.
 * Pass authorId to filter by a specific user (used on profile pages).
 * The author field is populated with username and profilePicture.
 */
export async function getFeed(
  page: number,
  limit: number,
  authorId?: string,
  requesterId?: string
): Promise<FeedResult> {
  const filter = authorId ? { author: authorId } : {};
  const skip = (page - 1) * limit;

  const [posts, total] = await Promise.all([
    Post.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("author", "username profilePicture"),
    Post.countDocuments(filter),
  ]);

  const likedSet = await getLikedSet(
    requesterId,
    posts.map((p) => p._id.toString())
  );

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const items = posts.map((p) => ({
    ...(p.toObject() as any),
    isLikedByUser: likedSet.has(p._id.toString()),
  }));

  return { items, page, limit, hasMore: skip + items.length < total };
}

/**
 * Returns a single post by ID with isLikedByUser flag.
 * Returns null if not found — the controller sends the 404.
 */
export async function getPostById(
  id: string,
  requesterId?: string
): Promise<any | null> {
  const post = await Post.findById(id).populate("author", "username profilePicture");
  if (!post) return null;

  const likedSet = await getLikedSet(requesterId, [post._id.toString()]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return {
    ...(post.toObject() as any),
    isLikedByUser: likedSet.has(post._id.toString()),
  };
}

/**
 * Updates the text and optionally the image/FEN of a post.
 * Throws 403 if the requesting user is not the post author.
 * Throws 404 if the post doesn't exist.
 *
 * imageUrl:
 *   string    → replace with new image
 *   null      → remove existing image
 *   undefined → leave image unchanged
 *
 * fen:
 *   string    → update FEN
 *   ""        → clear FEN
 *   undefined → leave FEN unchanged
 */
export async function updatePost(
  postId: string,
  requesterId: string,
  text: string,
  imageUrl?: string | null,
  fen?: string
): Promise<IPost> {
  const post = await Post.findById(postId);

  if (!post) throw { status: 404, message: "Post not found" };

  if (post.author.toString() !== requesterId) {
    throw { status: 403, message: "Not authorized to edit this post" };
  }

  post.text = text;

  if (imageUrl !== undefined) {
    if (post.imageUrl) await deleteImageFile(post.imageUrl);
    post.imageUrl = imageUrl ?? undefined;
  }

  if (fen !== undefined) {
    post.fen = fen.trim();
  }

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

  if (post.imageUrl) {
    await deleteImageFile(post.imageUrl);
  }

  await post.deleteOne();
}