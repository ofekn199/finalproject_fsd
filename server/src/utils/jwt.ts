import jwt, { JwtPayload, Secret, SignOptions } from "jsonwebtoken";

type TokenPayload = { id: string };

function getRequiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing ${name} in environment variables`);
  return value;
}

const accessSecret: Secret = getRequiredEnv("JWT_ACCESS_SECRET");
const refreshSecret: Secret = getRequiredEnv("JWT_REFRESH_SECRET");

// Keep expiresIn strongly typed for jsonwebtoken
const accessExpiresIn: SignOptions["expiresIn"] = getRequiredEnv("ACCESS_TOKEN_EXPIRES_IN") as SignOptions["expiresIn"];
const refreshExpiresIn: SignOptions["expiresIn"] = getRequiredEnv("REFRESH_TOKEN_EXPIRES_IN") as SignOptions["expiresIn"];

export function generateAccessToken(payload: TokenPayload): string {
  return jwt.sign(payload, accessSecret, { expiresIn: accessExpiresIn });
}

export function generateRefreshToken(payload: TokenPayload): string {
  return jwt.sign(payload, refreshSecret, { expiresIn: refreshExpiresIn });
}

export function verifyAccessToken(token: string): JwtPayload {
  return jwt.verify(token, accessSecret) as JwtPayload;
}

export function verifyRefreshToken(token: string): JwtPayload {
  return jwt.verify(token, refreshSecret) as JwtPayload;
}