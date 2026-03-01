import { Request, Response, NextFunction } from "express";
import { registerUser, loginUser, refreshTokens, logoutUser } from "../services/auth.service";
import { verifyAccessToken } from "../utils/jwt";

export async function register(req: Request, res: Response, next: NextFunction) {
  try {
    const { username, email, password } = req.body;
    const user = await registerUser(username, email, password);

    res.status(201).json(user);
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

export async function logout(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Missing access token" });
    }

    const token = authHeader.split(" ")[1];
    const payload = verifyAccessToken(token);
    const userId = String(payload.id);

    await logoutUser(userId);
    res.json({ message: "Logged out" });
  } catch (err) {
    next(err);
  }
}