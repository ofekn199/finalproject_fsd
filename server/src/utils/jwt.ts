import jwt, { JwtPayload, Secret, SignOptions } from "jsonwebtoken";
import crypto from "crypto";

/**
 * JWT utility — handles creation and verification of access & refresh tokens.
 *
 * We use TWO separate tokens:
 *  - Access token:  short-lived (15 min), sent with every API request as a Bearer header.
 *  - Refresh token: long-lived (7 days), stored in MongoDB, used only to get a new access token.
 *
 * Each refresh token gets a unique `jti` (JWT ID) so we can detect token reuse.
 * The secrets come from environment variables — never hardcoded.
 */

type AccessTokenPayload = {
  id: string; // MongoDB user _id
};

type RefreshTokenPayload = {
  id: string;
  jti: string; // Unique ID per token — allows server-side invalidation
};

function getRequiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing ${name} in environment variables`);
  }
  return value;
}

// Read secrets and expiry from .env at startup — fails loudly if missing
const accessSecret: Secret = getRequiredEnv("JWT_ACCESS_SECRET");
const refreshSecret: Secret = getRequiredEnv("JWT_REFRESH_SECRET");

const accessExpiresIn = getRequiredEnv("ACCESS_TOKEN_EXPIRES_IN") as SignOptions["expiresIn"];
const refreshExpiresIn = getRequiredEnv("REFRESH_TOKEN_EXPIRES_IN") as SignOptions["expiresIn"];

// Signs a short-lived access token with the user's id
export function generateAccessToken(payload: AccessTokenPayload): string {
  return jwt.sign(payload, accessSecret, { expiresIn: accessExpiresIn });
}

// Signs a long-lived refresh token — adds a random jti to allow rotation detection
export function generateRefreshToken(payload: AccessTokenPayload): string {
  const refreshPayload: RefreshTokenPayload = {
    id: payload.id,
    jti: crypto.randomUUID(),
  };

  return jwt.sign(refreshPayload, refreshSecret, { expiresIn: refreshExpiresIn });
}

// Throws if the token is expired or the signature is wrong
export function verifyAccessToken(token: string): JwtPayload {
  return jwt.verify(token, accessSecret) as JwtPayload;
}

export function verifyRefreshToken(token: string): JwtPayload {
  return jwt.verify(token, refreshSecret) as JwtPayload;
}