import express from "express";
import cors from "cors";
import path from "path";
import { env } from "./config/env";
import { errorMiddleware } from "./middlewares/error.middleware";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./docs/swagger";
import { healthRouter } from "./routes/health.routes";
import { authRouter } from "./routes/auth.routes";
import { userRouter } from "./routes/user.routes";

// Create and configure the Express app
export function createApp() {
  const app = express();

  app.use(cors({ origin: env.corsOrigin, credentials: true }));
  app.use(express.json());

  // Serve uploaded images statically
  app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

  // Swagger API docs
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  app.use("/health", healthRouter);
  app.use("/auth", authRouter);
  app.use("/users", userRouter);


  // Global error handler (should be last middleware)
  app.use(errorMiddleware);

  return app;
}