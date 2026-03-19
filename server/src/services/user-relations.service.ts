import mongoose from "mongoose";
import { Like } from "../models/like.model";
import { Comment } from "../models/comment.model";
import { Post } from "../models/post.model";

/**
 * Returns posts liked by a specific user.
 * The response is sorted by newest post first.
 */
export async function getLikedPostsByUser(userId: string) {
  const likes = await Like.find({ user: userId }).select("post");
  const postIds = likes.map((like) => like.post);

  if (postIds.length === 0) {
    return [];
  }

  const posts = await Post.find({ _id: { $in: postIds } })
    .populate("author", "username profilePicture profileImage")
    .sort({ createdAt: -1 });

  return posts;
}

/**
 * Returns posts that the user has commented on.
 * Uses distinct post IDs so the same post is returned only once.
 */
export async function getCommentedPostsByUser(userId: string) {
  const postIds = await Comment.distinct("post", {
    author: new mongoose.Types.ObjectId(userId),
  });

  if (postIds.length === 0) {
    return [];
  }

  const posts = await Post.find({ _id: { $in: postIds } })
    .populate("author", "username profilePicture profileImage")
    .sort({ createdAt: -1 });

  return posts;
}