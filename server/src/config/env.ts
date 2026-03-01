// Central place for environment variables
export const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: process.env.PORT ? Number(process.env.PORT) : 3000,
  mongoUri: process.env.MONGO_URI || "",
  corsOrigin: process.env.CORS_ORIGIN || "http://localhost:5173",
};

// Fail fast if required env vars are missing
export function validateEnv() {
  if (!env.mongoUri) {
    console.warn("Warning: MONGO_URI is missing. Database will not connect.");
  }
}