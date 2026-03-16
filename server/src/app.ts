import express from "express";
import cors from "cors";
import { env } from "./config/env";
import { errorMiddleware } from "./middlewares/error.middleware";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./docs/swagger";
import { healthRouter } from "./routes/health.routes";
import { authRouter } from "./routes/auth.routes";

// Create and configure the Express app
export function createApp() {
  const app = express();

  app.use(cors({ origin: env.corsOrigin, credentials: true }));
  app.use(express.json());

  // Swagger API docs
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  app.use("/health", healthRouter);
  app.use("/auth", authRouter);
    // Global error handler (should be last middleware)
  app.use(errorMiddleware);

  return app;
}