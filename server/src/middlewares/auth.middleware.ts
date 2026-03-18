import { NextFunction, Request, Response } from "express";
import { verifyAccessToken } from "../utils/jwt";

/**
 * Auth middleware — protects routes that require a logged-in user.
 *
 * How it works:
 *  1. Reads the "Authorization: Bearer <token>" header
 *  2. Verifies the JWT access token signature and expiry
 *  3. Attaches req.user = { id } so downstream controllers know who is making the request
 *
 * Usage: add `authMiddleware` before any route handler that needs authentication.
 */

// AuthRequest extends Express's Request to include the `user` field we attach
export interface AuthRequest extends Request {
  user?: {
    id: string; // MongoDB _id of the authenticated user
  };
}

/**
 * optionalAuthMiddleware — same as authMiddleware but never rejects.
 * If a valid Bearer token is present it sets req.user; otherwise it skips silently.
 * Use this on public routes that benefit from knowing the requester's identity
 * (e.g. to include isLikedByUser in the feed).
 */
export function optionalAuthMiddleware(req: AuthRequest, _res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];
      const payload = verifyAccessToken(token);
      req.user = { id: String(payload.id) };
    }
  } catch {
    // invalid/expired token — treat as unauthenticated, don't block
  }
  next();
}

export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;

    // Token must be in format: "Bearer eyJ..."
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Missing access token" });
    }

    const token = authHeader.split(" ")[1];
    const payload = verifyAccessToken(token); // throws if expired or tampered

    // Attach user id to the request so controllers can use it
    req.user = {
      id: String(payload.id),
    };

    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired access token" });
  }
}