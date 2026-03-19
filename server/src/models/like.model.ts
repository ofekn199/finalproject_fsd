import mongoose, { Schema, Document, Types } from "mongoose";

/**
 * ILike — represents a single like relationship between a user and a post.
 * The unique compound index on (user, post) prevents double-liking.
 * likesCount on the Post document is incremented/decremented by the like service.
 */
export interface ILike extends Document {
  user: Types.ObjectId;
  post: Types.ObjectId;
}

const likeSchema = new Schema<ILike>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    post: { type: Schema.Types.ObjectId, ref: "Post", required: true },
  },
  { timestamps: true }
);

// Compound unique index: one like per user per post
likeSchema.index({ user: 1, post: 1 }, { unique: true });

export const Like = mongoose.model<ILike>("Like", likeSchema);
