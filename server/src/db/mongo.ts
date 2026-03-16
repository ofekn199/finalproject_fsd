import mongoose from "mongoose";
import { env } from "../config/env";

// Connect to MongoDB
export async function connectMongo() {
  if (!env.mongoUri) {
    console.warn("Warning: MONGO_URI is missing. Skipping MongoDB connection.");
    return;
  }

  try {
    await mongoose.connect(env.mongoUri);
    console.log("Connected to MongoDB");
  } catch (err) {
    console.error("Failed to connect to MongoDB");
    throw err;
  }
}