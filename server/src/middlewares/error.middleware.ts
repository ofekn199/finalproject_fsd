import { NextFunction, Request, Response } from "express";
import mongoose from "mongoose";

// Central error handler (keeps responses consistent)
export function errorMiddleware(
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  // Mongoose validation errors (e.g. maxlength exceeded) → 400
  if (err instanceof mongoose.Error.ValidationError) {
    return res.status(400).json({ message: "Validation failed" });
  }

  const status = err?.status || 500;
  const message = err?.message || "Internal server error";

  res.status(status).json({ message });
}