import bcrypt from "bcrypt";
import { User } from "../models/user.model";
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from "../utils/jwt";

/**
 * Auth service — core business logic for registration, login, token refresh, and logout.
 * Controllers call these functions and handle the HTTP response.
 * Errors are thrown as plain objects { status, message } and caught by errorMiddleware.
 */

// Register a new user — hashes the password, stores in DB, returns the user (no tokens)
export async function registerUser(username: string, email: string, password: string) {
  // Check uniqueness before hashing to give a clear error message
  const existingUsername = await User.findOne({ username });
  if (existingUsername) {
    throw { status: 409, message: "Username already exists" };
  }

  const existingEmail = await User.findOne({ email });
  if (existingEmail) {
    throw { status: 409, message: "Email already exists" };
  }

  // 10 salt rounds is the standard bcrypt cost — slow enough to resist brute force
  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await User.create({
    username,
    email,
    password: hashedPassword,
  });

  return user;
}

// Login — verifies password and returns a fresh pair of access + refresh tokens
export async function loginUser(username: string, password: string) {
  const user = await User.findOne({ username });

  // Return the same error for "user not found" and "wrong password"
  // so attackers can't enumerate existing usernames
  if (!user) {
    throw { status: 401, message: "Invalid credentials" };
  }

  // Google-only accounts have no password — treat as invalid credentials
  if (!user.password) {
    throw { status: 401, message: "Invalid credentials" };
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    throw { status: 401, message: "Invalid credentials" };
  }

  const userId = user._id.toString();

  const accessToken = generateAccessToken({ id: userId });
  const refreshToken = generateRefreshToken({ id: userId });

  // Store the refresh token in the DB so we can validate and rotate it later
  user.refreshToken = refreshToken;
  await user.save();

  return { accessToken, refreshToken };
}

// Refresh tokens — verifies the old refresh token, issues a new pair (rotation)
// Token rotation means a stolen refresh token can only be used once
export async function refreshTokens(refreshToken: string) {
  // verifyRefreshToken throws a raw JWT error on invalid tokens — we catch it
  // and convert to a clean { status: 401 } so errorMiddleware returns the right status
  let payload;
  try {
    payload = verifyRefreshToken(refreshToken);
  } catch {
    throw { status: 401, message: "Invalid refresh token" };
  }
  const userId = String(payload.id);

  const user = await User.findById(userId);
  if (!user || !user.refreshToken) {
    throw { status: 401, message: "Invalid refresh token" };
  }

  // DB check: make sure the token hasn't already been rotated (reuse detection)
  if (user.refreshToken !== refreshToken) {
    throw { status: 401, message: "Invalid refresh token" };
  }

  const newAccessToken = generateAccessToken({ id: userId });
  const newRefreshToken = generateRefreshToken({ id: userId });

  // Replace old refresh token in DB with the new one
  user.refreshToken = newRefreshToken;
  await user.save();

  return { accessToken: newAccessToken, refreshToken: newRefreshToken };
}

// Logout — clears the refresh token from DB so it can never be reused
export async function logoutUser(userId: string) {
  const user = await User.findById(userId);
  if (!user) return;

  user.refreshToken = undefined;
  await user.save();
}