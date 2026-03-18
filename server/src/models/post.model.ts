import mongoose, { Schema, Document, Types } from "mongoose";

/**
 * IPost — TypeScript interface describing a Post document in MongoDB.
 * author references the User who created the post.
 * imageUrl is optional — only set when the user uploads an image with the post.
 * likesCount and commentsCount are counters updated when likes/comments are added or removed.
 * This avoids loading full arrays just to display a number in the feed.
 */
export interface IPost extends Document {
  author: Types.ObjectId;
  text: string;
  imageUrl?: string;
  likesCount: number;
  commentsCount: number;
}

const postSchema = new Schema<IPost>(
  {
    // ref: "User" lets Mongoose populate the author field with the full user object
    author: { type: Schema.Types.ObjectId, ref: "User", required: true },
    text: { type: String, required: true, maxlength: 500 },
    // imageUrl stores the path served by /uploads e.g. "/uploads/filename.jpg"
    imageUrl: { type: String },
    // counters are incremented/decremented by the like and comment services
    likesCount: { type: Number, default: 0 },
    commentsCount: { type: Number, default: 0 },
  },
  { timestamps: true } // automatically adds createdAt and updatedAt fields
);

export const Post = mongoose.model<IPost>("Post", postSchema);
