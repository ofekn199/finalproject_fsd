import { Like } from "../models/like.model";
import { Post } from "../models/post.model";

/**
 * toggleLike — likes a post if the user hasn't liked it yet, unlikes if they have.
 * Updates the Post's likesCount counter atomically.
 * Returns { liked, likesCount } so the client can update its UI in one round-trip.
 */
export async function toggleLike(
  postId: string,
  userId: string
): Promise<{ liked: boolean; likesCount: number }> {
  const post = await Post.findById(postId);
  if (!post) throw { status: 404, message: "Post not found" };

  const existing = await Like.findOne({ user: userId, post: postId });

  if (existing) {
    // Already liked — remove like and decrement counter
    await existing.deleteOne();
    const updated = await Post.findByIdAndUpdate(
      postId,
      { $inc: { likesCount: -1 } },
      { new: true }
    );
    return { liked: false, likesCount: updated?.likesCount ?? 0 };
  } else {
    // Not yet liked — create like and increment counter
    await Like.create({ user: userId, post: postId });
    const updated = await Post.findByIdAndUpdate(
      postId,
      { $inc: { likesCount: 1 } },
      { new: true }
    );
    return { liked: true, likesCount: updated?.likesCount ?? 1 };
  }
}
