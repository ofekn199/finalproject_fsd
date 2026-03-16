import { NextFunction, Request, Response } from "express";

// Central error handler (keeps responses consistent)
export function errorMiddleware(
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  const status = err?.status || 500;
  const message = err?.message || "Internal server error";

  res.status(status).json({ message });
}