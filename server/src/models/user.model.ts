import mongoose, { Schema, Document } from "mongoose";

/**
 * IUser — TypeScript interface describing a User document in MongoDB.
 * password is optional because Google OAuth users don't have one.
 * googleId is optional because regular users (email+password) don't have one.
 * refreshToken is stored here so we can invalidate it on logout.
 * profilePicture stores the server-relative path e.g. "/uploads/abc.jpg".
 * bio is a short optional description the user writes about themselves.
 */
export interface IUser extends Document {
  username: string;
  email: string;
  password?: string;
  googleId?: string;
  refreshToken?: string;
  profilePicture?: string;
  bio?: string;
}

const userSchema = new Schema<IUser>(
  {
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    // password is hashed with bcrypt before saving — never stored as plain text
    password: { type: String, required: false },
    // googleId comes from Google's OAuth token payload (field "sub")
    googleId: { type: String },
    // refreshToken is rotated on every refresh request and cleared on logout
    refreshToken: { type: String },
    // URL path to avatar image served by Express static middleware
    profilePicture: { type: String },
    bio: { type: String, maxlength: 300 },
  },
  { timestamps: true } // automatically adds createdAt and updatedAt fields
);

export const User = mongoose.model<IUser>("User", userSchema);