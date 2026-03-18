import { Request, Response, NextFunction } from "express";
import { registerUser, loginUser, refreshTokens, logoutUser } from "../services/auth.service";
import { AuthRequest } from "../middlewares/auth.middleware";
import { loginWithGoogle } from "../services/google-auth.service";

/**
 * Auth controller — thin layer between HTTP and the auth service.
 * Responsibilities: extract request data, call the service, send the response.
 * All errors are forwarded to next() and handled by errorMiddleware.
 */

// POST /auth/register — creates a new user, returns their public info (no tokens)
export async function register(req: Request, res: Response, next: NextFunction) {
  try {
    const { username, email, password } = req.body;
    const user = await registerUser(username, email, password);

    res.status(201).json({
      id: user._id.toString(),
      username: user.username,
      email: user.email,
    });
  } catch (err) {
    next(err);
  }
}

// POST /auth/login — verifies credentials and returns access + refresh tokens
export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const { username, password } = req.body;
    const tokens = await loginUser(username, password);
    res.json(tokens);
  } catch (err) {
    next(err);
  }
}

// POST /auth/refresh — exchanges a valid refresh token for a new token pair
export async function refresh(req: Request, res: Response, next: NextFunction) {
  try {
    const { refreshToken } = req.body;
    const tokens = await refreshTokens(refreshToken);
    res.json(tokens);
  } catch (err) {
    next(err);
  }
}

// POST /auth/logout — invalidates the refresh token in the DB
// req.user is set by authMiddleware (Bearer token must be present)
export async function logout(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    await logoutUser(req.user.id);
    res.json({ message: "Logged out" });
  } catch (err) {
    next(err);
  }
}

// POST /auth/google — receives Google ID token from frontend, returns our own tokens
export async function googleLogin(req: Request, res: Response, next: NextFunction) {
  try {
    const { credential } = req.body;
    const result = await loginWithGoogle(credential);
    res.json(result);
  } catch (err) {
    next(err);
  }
}