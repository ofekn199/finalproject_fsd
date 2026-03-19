import { OAuth2Client } from "google-auth-library";
import { env } from "../config/env";
import { User } from "../models/user.model";
import { generateAccessToken, generateRefreshToken } from "../utils/jwt";

/**
 * Google OAuth service — verifies the ID token sent from the frontend
 * and returns our own application tokens (access + refresh).
 *
 * Flow:
 *  1. Frontend shows Google button → user clicks → Google returns a credential (ID token)
 *  2. Frontend sends that credential to POST /auth/google
 *  3. This service verifies it with Google's servers
 *  4. If valid, we find or create the user in our DB and return our own JWT tokens
 */

// OAuth2Client is the Google library used to verify tokens
const client = new OAuth2Client(env.googleClientId);

export async function loginWithGoogle(credential: string) {
  // verifyIdToken calls Google's servers to confirm the token is genuine
  const ticket = await client.verifyIdToken({
    idToken: credential,
    audience: env.googleClientId, // must match the client ID we gave the frontend
  });

  const payload = ticket.getPayload();

  if (!payload || !payload.email || !payload.sub) {
    throw { status: 401, message: "Invalid Google credential" };
  }

  const email = payload.email;
  const googleId = payload.sub; // "sub" is Google's unique ID for this user

  // Look up user by email OR googleId (handles the case where they registered by email first)
  let user = await User.findOne({
    $or: [{ email }, { googleId }],
  });

  if (!user) {
    // First time this Google account logs in — auto-create a user
    // Username is derived from the email prefix (e.g. "john" from "john@gmail.com")
    const baseUsername = email.split("@")[0];
    let username = baseUsername;
    let counter = 1;

    // Ensure username is unique by appending a number if needed
    while (await User.findOne({ username })) {
      username = `${baseUsername}${counter}`;
      counter += 1;
    }

    user = await User.create({
      username,
      email,
      googleId,
    });
  } else if (!user.googleId) {
    // User registered with email+password before — link their Google account
    user.googleId = googleId;
    await user.save();
  }

  const userId = user._id.toString();

  // Issue our own tokens — same as a normal login
  const accessToken = generateAccessToken({ id: userId });
  const refreshToken = generateRefreshToken({ id: userId });

  user.refreshToken = refreshToken;
  await user.save();

  return {
    accessToken,
    refreshToken,
    user: {
      id: userId,
      username: user.username,
      email: user.email,
    },
  };
}