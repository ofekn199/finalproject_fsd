import { OAuth2Client } from "google-auth-library";
import { env } from "../config/env";
import { User } from "../models/user.model";
import { generateAccessToken, generateRefreshToken } from "../utils/jwt";

const client = new OAuth2Client(env.googleClientId);

// Verify Google credential and return application tokens
export async function loginWithGoogle(credential: string) {
  const ticket = await client.verifyIdToken({
    idToken: credential,
    audience: env.googleClientId,
  });

  const payload = ticket.getPayload();

  if (!payload || !payload.email || !payload.sub) {
    throw { status: 401, message: "Invalid Google credential" };
  }

  const email = payload.email;
  const googleId = payload.sub;

  let user = await User.findOne({
    $or: [{ email }, { googleId }],
  });

  if (!user) {
    const baseUsername = email.split("@")[0];
    let username = baseUsername;
    let counter = 1;

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
    user.googleId = googleId;
    await user.save();
  }

  const userId = user._id.toString();

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