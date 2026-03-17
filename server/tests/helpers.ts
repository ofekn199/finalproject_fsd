/**
 * Test Helpers — Shared factory functions for all test files.
 *
 * Usage pattern:
 *   beforeAll(async () => {
 *     user  = await registerAndLogin(app);
 *     post  = await createPost(app, user.accessToken);
 *     // comment tests:
 *     comment = await createComment(app, user.accessToken, post._id);
 *   });
 *
 * Each factory hits the real API (no mocks) and returns the created document.
 * Default values use a random suffix so multiple calls never collide.
 */

import request from "supertest";
import { Express } from "express";

// ── Types ────────────────────────────────────────────────────────────────────

export interface TestUser {
  userId: string;
  username: string;
  email: string;
  password: string;
  accessToken: string;
  refreshToken: string;
}

export interface TestPost {
  _id: string;
  text: string;
  imageUrl?: string;
  author: string;
  likesCount: number;
  commentsCount: number;
  createdAt: string;
}

export interface TestComment {
  _id: string;
  text: string;
  author: string;
  post: string;
  createdAt: string;
}

// ── Factories ────────────────────────────────────────────────────────────────

/**
 * Registers a new user and immediately logs in.
 * Returns both the user info and the JWT tokens.
 */
export async function registerAndLogin(
  app: Express,
  overrides?: { username?: string; email?: string; password?: string }
): Promise<TestUser> {
  const suffix = Math.random().toString(36).slice(2, 8);
  const username = overrides?.username ?? `testuser_${suffix}`;
  const email = overrides?.email ?? `test_${suffix}@example.com`;
  const password = overrides?.password ?? "Pass1234!";

  // Register
  await request(app).post("/auth/register").send({ username, email, password });

  // Login to get tokens
  const loginRes = await request(app)
    .post("/auth/login")
    .send({ username, password });

  // Decode the JWT payload to extract userId — the login endpoint only returns tokens
  const jwtPayload = JSON.parse(
    Buffer.from(loginRes.body.accessToken.split(".")[1], "base64").toString()
  );

  return {
    userId: jwtPayload.id,
    username,
    email,
    password,
    accessToken: loginRes.body.accessToken,
    refreshToken: loginRes.body.refreshToken,
  };
}

/**
 * Creates a post via POST /posts.
 * Requires a valid accessToken from registerAndLogin().
 */
export async function createPost(
  app: Express,
  accessToken: string,
  overrides?: { text?: string }
): Promise<TestPost> {
  const text = overrides?.text ?? "Test post content";

  const res = await request(app)
    .post("/posts")
    .set("Authorization", `Bearer ${accessToken}`)
    .send({ text });

  return res.body;
}

/**
 * Creates a comment via POST /posts/:id/comments.
 * Used in comment test files — the post is already created by createPost().
 */
export async function createComment(
  app: Express,
  accessToken: string,
  postId: string,
  overrides?: { text?: string }
): Promise<TestComment> {
  const text = overrides?.text ?? "Test comment";

  const res = await request(app)
    .post(`/posts/${postId}/comments`)
    .set("Authorization", `Bearer ${accessToken}`)
    .send({ text });

  return res.body;
}
