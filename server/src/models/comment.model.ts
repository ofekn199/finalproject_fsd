import mongoose, { Document, Schema, Types } from "mongoose";

/**
 * IComment describes a single comment document.
 *
 * post: The post the comment belongs to.
 * author: The user who wrote the comment.
 * text: Comment content.
 * createdAt / updatedAt: Added automatically by Mongoose timestamps.
 */
export interface IComment extends Document {
  post: Types.ObjectId;
  author: Types.ObjectId;
  text: string;
  createdAt: Date;
  updatedAt: Date;
}

const commentSchema = new Schema<IComment>(
  {
    post: {
      type: Schema.Types.ObjectId,
      ref: "Post",
      required: true,
      index: true,
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    text: {
      type: String,
      required: true,
      trim: true,
      maxlength: 300,
    },
  },
  {
    timestamps: true,
  }
);

// Helpful for fetching comments ordered by creation time
commentSchema.index({ post: 1, createdAt: -1 });

export const Comment = mongoose.model<IComment>("Comment", commentSchema);