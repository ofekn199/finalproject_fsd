import mongoose, { Schema, Document, Types } from "mongoose";

/**
 * IPost — TypeScript interface describing a Post document in MongoDB.
 *
 * author: Reference to the User who created the post.
 * text: Main textual content of the post.
 * imageUrl: Optional image associated with the post.
 *
 * likesCount & commentsCount:
 * Stored as counters for performance reasons (avoids loading full arrays).
 *
 * createdAt & updatedAt:
 * Automatically added by Mongoose when using timestamps: true.
 */
export interface IPost extends Document {
  author: Types.ObjectId;
  text: string;
  imageUrl?: string;
  likesCount: number;
  commentsCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const postSchema = new Schema<IPost>(
  {
    /**
     * ref: "User"
     * Allows us to use .populate("author") later
     * to fetch user details (username, email, etc.)
     */
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true, // improves queries filtering by user
    },

    /**
     * text:
     * Main content of the post.
     * trim removes leading/trailing whitespace.
     */
    text: {
      type: String,
      required: true,
      maxlength: 500,
      trim: true,
    },

    /**
     * imageUrl:
     * Stores the path of the uploaded image.
     * Example: "/uploads/posts/abc123.jpg"
     */
    imageUrl: {
      type: String,
      default: "", // ensures consistency (never undefined)
    },

    /**
     * likesCount:
     * Updated when users like/unlike the post.
     */
    likesCount: {
      type: Number,
      default: 0,
    },

    /**
     * commentsCount:
     * Updated when comments are added/removed.
     */
    commentsCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true, // adds createdAt & updatedAt automatically
  }
);

/**
 * Index for fast feed queries
 * Important because feed is sorted by newest posts
 */
postSchema.index({ createdAt: -1 });

export const Post = mongoose.model<IPost>("Post", postSchema);