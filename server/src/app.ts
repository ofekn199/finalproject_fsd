import express from "express";
import cors from "cors";
import { env } from "./config/env";
import { errorMiddleware } from "./middlewares/error.middleware";

// Create and configure the Express app
export function createApp() {
  const app = express();

  app.use(cors({ origin: env.corsOrigin, credentials: true }));
  app.use(express.json());

  // Health check endpoint
  app.get("/health", (_req, res) => {
    res.json({ status: "ok" });
  });
    // Global error handler (should be last middleware)
  app.use(errorMiddleware);
  
  return app;
}