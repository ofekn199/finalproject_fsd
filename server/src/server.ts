import dotenv from "dotenv";
import { createApp } from "./app";
import { validateEnv, env } from "./config/env";
import { connectMongo } from "./db/mongo";

dotenv.config();
validateEnv();

const app = createApp();

// Start the HTTP server
async function start() {
  await connectMongo();

  app.listen(env.port, () => {
    console.log(`ArenaX server running on port ${env.port}`);
  });
}

start().catch((err) => {
  console.error("Server failed to start", err);
  process.exit(1);
});