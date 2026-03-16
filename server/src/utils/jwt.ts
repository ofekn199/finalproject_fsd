import jwt, { JwtPayload, Secret, SignOptions } from "jsonwebtoken";
import crypto from "crypto";

type AccessTokenPayload = {
  id: string;
};

type RefreshTokenPayload = {
  id: string;
  jti: string;
};

function getRequiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing ${name} in environment variables`);
  }
  return value;
}

const accessSecret: Secret = getRequiredEnv("JWT_ACCESS_SECRET");
const refreshSecret: Secret = getRequiredEnv("JWT_REFRESH_SECRET");

const accessExpiresIn = getRequiredEnv("ACCESS_TOKEN_EXPIRES_IN") as SignOptions["expiresIn"];
const refreshExpiresIn = getRequiredEnv("REFRESH_TOKEN_EXPIRES_IN") as SignOptions["expiresIn"];

export function generateAccessToken(payload: AccessTokenPayload): string {
  return jwt.sign(payload, accessSecret, { expiresIn: accessExpiresIn });
}

export function generateRefreshToken(payload: AccessTokenPayload): string {
  const refreshPayload: RefreshTokenPayload = {
    id: payload.id,
    jti: crypto.randomUUID(),
  };

  return jwt.sign(refreshPayload, refreshSecret, { expiresIn: refreshExpiresIn });
}

export function verifyAccessToken(token: string): JwtPayload {
  return jwt.verify(token, accessSecret) as JwtPayload;
}

export function verifyRefreshToken(token: string): JwtPayload {
  return jwt.verify(token, refreshSecret) as JwtPayload;
}