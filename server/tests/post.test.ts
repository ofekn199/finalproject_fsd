/**
 * Post API Tests — TDD
 *
 * Seed data is created once in beforeAll and reused across all tests.
 * Two users are created: `owner` (who creates the seed post) and `otherUser`
 * (used to verify 403 Forbidden on ownership-protected actions).
 *
 * Endpoints covered:
 *   POST   /posts
 *   GET    /posts
 *   GET    /posts/:id
 *   PUT    /posts/:id
 *   DELETE /posts/:id
 */

import request from "supertest";
import { createApp } from "../src/app";
import { Express } from "express";
import { registerAndLogin, createPost, TestUser, TestPost } from "./helpers";
import mongoose from "mongoose";

const app: Express = createApp();

// Seed data — created once, reused by all tests
let owner: TestUser;
let otherUser: TestUser;
let seedPost: TestPost;

beforeAll(async () => {
  // Create two users: the post owner and a different user to test auth boundaries
  owner = await registerAndLogin(app);
  otherUser = await registerAndLogin(app);

  // Create one seed post owned by `owner`
  seedPost = await createPost(app, owner.accessToken, { text: "Seed post for testing" });
});

// ── POST /posts ──────────────────────────────────────────────────────────────

describe("POST /posts", () => {
  it("should create a post with text only", async () => {
    const res = await request(app)
      .post("/posts")
      .set("Authorization", `Bearer ${owner.accessToken}`)
      .send({ text: "Hello ArenaX!" });

    expect(res.status).toBe(201);
    expect(res.body.text).toBe("Hello ArenaX!");
    expect(res.body.author).toBeDefined();
    expect(res.body.likesCount).toBe(0);
    expect(res.body.commentsCount).toBe(0);
    expect(res.body._id).toBeDefined();
  });

  it("should reject post with missing text", async () => {
    const res = await request(app)
      .post("/posts")
      .set("Authorization", `Bearer ${owner.accessToken}`)
      .send({});

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Validation failed");
  });

  it("should reject unauthenticated request", async () => {
    const res = await request(app)
      .post("/posts")
      .send({ text: "No token" });

    expect(res.status).toBe(401);
  });

  it("should reject text that is too long (> 500 chars)", async () => {
    const res = await request(app)
      .post("/posts")
      .set("Authorization", `Bearer ${owner.accessToken}`)
      .send({ text: "a".repeat(501) });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Validation failed");
  });
});

// ── GET /posts (feed) ────────────────────────────────────────────────────────

describe("GET /posts", () => {
  it("should return paginated feed with default page and limit", async () => {
    const res = await request(app).get("/posts");

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.items)).toBe(true);
    expect(res.body.page).toBe(1);
    expect(res.body.limit).toBe(10);
    expect(typeof res.body.hasMore).toBe("boolean");
  });

  it("should respect custom page and limit query params", async () => {
    const res = await request(app).get("/posts?page=1&limit=2");

    expect(res.status).toBe(200);
    expect(res.body.page).toBe(1);
    expect(res.body.limit).toBe(2);
    expect(res.body.items.length).toBeLessThanOrEqual(2);
  });

  it("should populate author username in each post", async () => {
    const res = await request(app).get("/posts");

    expect(res.status).toBe(200);
    if (res.body.items.length > 0) {
      const post = res.body.items[0];
      expect(post.author).toBeDefined();
      expect(post.author.username).toBeDefined();
    }
  });
});

// ── GET /posts/:id ───────────────────────────────────────────────────────────

describe("GET /posts/:id", () => {
  it("should return a post by ID", async () => {
    const res = await request(app).get(`/posts/${seedPost._id}`);

    expect(res.status).toBe(200);
    expect(res.body._id).toBe(seedPost._id);
    expect(res.body.text).toBe("Seed post for testing");
  });

  it("should return 404 for a non-existent post ID", async () => {
    const fakeId = new mongoose.Types.ObjectId().toString();
    const res = await request(app).get(`/posts/${fakeId}`);

    expect(res.status).toBe(404);
  });

  it("should return 400 for an invalid ObjectId format", async () => {
    const res = await request(app).get("/posts/not-a-valid-id");

    expect(res.status).toBe(400);
  });
});

// ── PUT /posts/:id ───────────────────────────────────────────────────────────

describe("PUT /posts/:id", () => {
  it("should allow the owner to update the post text", async () => {
    const res = await request(app)
      .put(`/posts/${seedPost._id}`)
      .set("Authorization", `Bearer ${owner.accessToken}`)
      .send({ text: "Updated text" });

    expect(res.status).toBe(200);
    expect(res.body.text).toBe("Updated text");
  });

  it("should return 403 when a non-owner tries to update", async () => {
    const res = await request(app)
      .put(`/posts/${seedPost._id}`)
      .set("Authorization", `Bearer ${otherUser.accessToken}`)
      .send({ text: "Stolen edit" });

    expect(res.status).toBe(403);
  });

  it("should return 401 when unauthenticated", async () => {
    const res = await request(app)
      .put(`/posts/${seedPost._id}`)
      .send({ text: "No token" });

    expect(res.status).toBe(401);
  });

  it("should return 404 for a non-existent post", async () => {
    const fakeId = new mongoose.Types.ObjectId().toString();
    const res = await request(app)
      .put(`/posts/${fakeId}`)
      .set("Authorization", `Bearer ${owner.accessToken}`)
      .send({ text: "Ghost post" });

    expect(res.status).toBe(404);
  });
});

// ── DELETE /posts/:id ────────────────────────────────────────────────────────

describe("DELETE /posts/:id", () => {
  it("should return 403 when a non-owner tries to delete", async () => {
    const res = await request(app)
      .delete(`/posts/${seedPost._id}`)
      .set("Authorization", `Bearer ${otherUser.accessToken}`);

    expect(res.status).toBe(403);
  });

  it("should return 401 when unauthenticated", async () => {
    const res = await request(app)
      .delete(`/posts/${seedPost._id}`);

    expect(res.status).toBe(401);
  });

  it("should return 404 for a non-existent post", async () => {
    const fakeId = new mongoose.Types.ObjectId().toString();
    const res = await request(app)
      .delete(`/posts/${fakeId}`)
      .set("Authorization", `Bearer ${owner.accessToken}`);

    expect(res.status).toBe(404);
  });

  it("should allow the owner to delete their post", async () => {
    // Create a disposable post specifically for deletion
    const disposable = await createPost(app, owner.accessToken, { text: "To be deleted" });

    const res = await request(app)
      .delete(`/posts/${disposable._id}`)
      .set("Authorization", `Bearer ${owner.accessToken}`);

    expect(res.status).toBe(200);

    // Verify it's gone
    const check = await request(app).get(`/posts/${disposable._id}`);
    expect(check.status).toBe(404);
  });
});
