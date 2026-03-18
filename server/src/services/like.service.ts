import { Like } from "../models/like.model";
import { Post } from "../models/post.model";

// MongoDB duplicate-key error code — thrown when the unique (user, post) index is violated
const MONGO_DUPLICATE_KEY = 11000;

/** Returns true when `err` is a MongoDB duplicate-key error (E11000). */
function isDuplicateKeyError(err: unknown): boolean {
  return (
    typeof err === "object" &&
    err !== null &&
    "code" in err &&
    (err as { code: unknown }).code === MONGO_DUPLICATE_KEY
  );
}

/**
 * toggleLike — likes a post if the user hasn't liked it yet, unlikes if they have.
 * Updates the Post's likesCount counter atomically.
 * Returns { liked, likesCount } so the client can update its UI in one round-trip.
 *
 * The unique compound index on Like(user, post) prevents double-liking.
 * A concurrent duplicate-like attempt (race condition) is caught and handled gracefully.
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
    try {
      await Like.create({ user: userId, post: postId });
    } catch (err: unknown) {
      // A concurrent request already created the like (duplicate key) — treat as already liked
      if (isDuplicateKeyError(err)) {
        const current = await Post.findById(postId);
        return { liked: true, likesCount: current?.likesCount ?? 1 };
      }
      throw err;
    }
    const updated = await Post.findByIdAndUpdate(
      postId,
      { $inc: { likesCount: 1 } },
      { new: true }
    );
    return { liked: true, likesCount: updated?.likesCount ?? 1 };
  }
}
