import { Comment } from "../models/comment.model";
import { Post } from "../models/post.model";

/**
 * Create a new comment for a post and increment the post comments counter.
 */
export async function createComment(postId: string, userId: string, text: string) {
  const post = await Post.findById(postId);

  if (!post) {
    throw { status: 404, message: "Post not found" };
  }

  const comment = await Comment.create({
    post: postId,
    author: userId,
    text,
  });

  await Post.findByIdAndUpdate(postId, {
    $inc: { commentsCount: 1 },
  });

  return comment.populate("author", "username profileImage");
}

/**
 * Return all comments for a specific post, newest first.
 */
export async function getCommentsByPost(postId: string) {
  const post = await Post.findById(postId);

  if (!post) {
    throw { status: 404, message: "Post not found" };
  }

  return Comment.find({ post: postId })
    .sort({ createdAt: -1 })
    .populate("author", "username profileImage");
}