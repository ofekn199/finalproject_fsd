import { Request, Response, NextFunction } from "express";
import { registerUser, loginUser, refreshTokens, logoutUser } from "../services/auth.service";
import { verifyAccessToken } from "../utils/jwt";
import { AuthRequest } from "../middlewares/auth.middleware";

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

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const { username, password } = req.body;
    const tokens = await loginUser(username, password);

    res.json(tokens);
  } catch (err) {
    next(err);
  }
}
export async function refresh(req: Request, res: Response, next: NextFunction) {
  try {
    const { refreshToken } = req.body;
    const tokens = await refreshTokens(refreshToken);
    res.json(tokens);
  } catch (err) {
    next(err);
  }
}

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