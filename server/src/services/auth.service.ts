import bcrypt from "bcrypt";
import { User } from "../models/user.model";
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from "../utils/jwt";

// Register a new user
export async function registerUser(username: string, email: string, password: string) {
  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await User.create({
    username,
    email,
    password: hashedPassword,
  });

  return user;
}

// Login user and return tokens
export async function loginUser(username: string, password: string) {
  const user = await User.findOne({ username });

  if (!user) {
    throw { status: 401, message: "Invalid credentials" };
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    throw { status: 401, message: "Invalid credentials" };
  }

const userId = user._id.toString();

const accessToken = generateAccessToken({ id: userId });
const refreshToken = generateRefreshToken({ id: userId });

  user.refreshToken = refreshToken;
  await user.save();

  return { accessToken, refreshToken };
}

// Refresh tokens (rotate refresh token)
export async function refreshTokens(refreshToken: string) {
  const payload = verifyRefreshToken(refreshToken);
  const userId = String(payload.id);

  const user = await User.findById(userId);
  if (!user || !user.refreshToken) {
    throw { status: 401, message: "Invalid refresh token" };
  }

  // Ensure the token matches what we stored
  if (user.refreshToken !== refreshToken) {
    throw { status: 401, message: "Invalid refresh token" };
  }

  const newAccessToken = generateAccessToken({ id: userId });
  const newRefreshToken = generateRefreshToken({ id: userId });

  user.refreshToken = newRefreshToken;
  await user.save();

  return { accessToken: newAccessToken, refreshToken: newRefreshToken };
}

// Logout user (invalidate refresh token)
export async function logoutUser(userId: string) {
  const user = await User.findById(userId);
  if (!user) return;

  user.refreshToken = undefined;
  await user.save();
}