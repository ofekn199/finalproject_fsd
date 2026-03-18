/**
 * User API Tests — TDD
 *
 * Seed data is created once in beforeAll and reused across all tests in this file.
 * Two users are created: `owner` (the authenticated user) and `otherUser`
 * (used to verify we can fetch another user's public profile and posts).
 *
 * Endpoints covered:
 *   GET  /users/:id          — get public profile
 *   PUT  /users/me           — update bio (auth required)
 *   POST /users/me/avatar    — upload profile picture (auth required)
 *   GET  /users/:id/posts    — get all posts by a user
 */

import request from "supertest";
import path from "path";
import { createApp } from "../src/app";
import { Express } from "express";
import { registerAndLogin, createPost, TestUser } from "./helpers";
import mongoose from "mongoose";

const app: Express = createApp();

// Seed data — created once, reused by all tests
let owner: TestUser;
let otherUser: TestUser;

beforeAll(async () => {
  owner = await registerAndLogin(app);
  otherUser = await registerAndLogin(app);

  // Give otherUser a couple of posts so we can test GET /users/:id/posts
  await createPost(app, otherUser.accessToken, { text: "Post one by other user" });
  await createPost(app, otherUser.accessToken, { text: "Post two by other user" });
});

// ── GET /users/:id ───────────────────────────────────────────────────────────

describe("GET /users/:id", () => {
  it("should return the public profile of an existing user", async () => {
    const res = await request(app).get(`/users/${owner.userId}`);

    expect(res.status).toBe(200);
    expect(res.body.username).toBe(owner.username);
    expect(res.body.email).toBe(owner.email);
  });

  it("should not expose sensitive fields", async () => {
    const res = await request(app).get(`/users/${owner.userId}`);

    expect(res.status).toBe(200);
    // These fields must never be returned to the client
    expect(res.body.password).toBeUndefined();
    expect(res.body.refreshToken).toBeUndefined();
    expect(res.body.googleId).toBeUndefined();
  });

  it("should return 404 for a non-existent user ID", async () => {
    const fakeId = new mongoose.Types.ObjectId().toString();
    const res = await request(app).get(`/users/${fakeId}`);

    expect(res.status).toBe(404);
    expect(res.body.message).toBe("User not found");
  });

  it("should return 400 for an invalid ObjectId format", async () => {
    const res = await request(app).get("/users/not-a-valid-id");

    expect(res.status).toBe(400);
  });
});

// ── PUT /users/me ────────────────────────────────────────────────────────────

describe("PUT /users/me", () => {
  it("should update the bio of the logged-in user", async () => {
    const res = await request(app)
      .put("/users/me")
      .set("Authorization", `Bearer ${owner.accessToken}`)
      .send({ bio: "Chess enthusiast" });

    expect(res.status).toBe(200);
    expect(res.body.bio).toBe("Chess enthusiast");
  });

  it("should return 401 when unauthenticated", async () => {
    const res = await request(app)
      .put("/users/me")
      .send({ bio: "No token" });

    expect(res.status).toBe(401);
  });

  it("should persist the updated bio on subsequent GET", async () => {
    await request(app)
      .put("/users/me")
      .set("Authorization", `Bearer ${owner.accessToken}`)
      .send({ bio: "Updated bio" });

    const res = await request(app).get(`/users/${owner.userId}`);
    expect(res.body.bio).toBe("Updated bio");
  });

  it("should update the username of the logged-in user", async () => {
    const newUsername = `updated_${Date.now()}`;
    const res = await request(app)
      .put("/users/me")
      .set("Authorization", `Bearer ${owner.accessToken}`)
      .send({ username: newUsername });

    expect(res.status).toBe(200);
    expect(res.body.username).toBe(newUsername);
    // Keep owner.username in sync for subsequent tests
    owner.username = newUsername;
  });

  it("should return 409 when the new username is already taken", async () => {
    const res = await request(app)
      .put("/users/me")
      .set("Authorization", `Bearer ${owner.accessToken}`)
      .send({ username: otherUser.username });

    expect(res.status).toBe(409);
    expect(res.body.message).toBe("Username already taken");
  });

  it("should reject a bio that is too long (> 300 chars)", async () => {
    const res = await request(app)
      .put("/users/me")
      .set("Authorization", `Bearer ${owner.accessToken}`)
      .send({ bio: "b".repeat(301) });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Validation failed");
  });

  it("should update both bio and username in one request", async () => {
    const newUsername = `combo_${Date.now()}`;
    const res = await request(app)
      .put("/users/me")
      .set("Authorization", `Bearer ${owner.accessToken}`)
      .send({ bio: "Combo update", username: newUsername });

    expect(res.status).toBe(200);
    expect(res.body.bio).toBe("Combo update");
    expect(res.body.username).toBe(newUsername);
    owner.username = newUsername;
  });
});

// ── POST /users/me/avatar ────────────────────────────────────────────────────

describe("POST /users/me/avatar", () => {
  it("should upload an avatar and return a profilePicture URL", async () => {
    // Use a real test image file shipped with the project
    const testImagePath = path.resolve(__dirname, "fixtures", "test-image.jpg");

    const res = await request(app)
      .post("/users/me/avatar")
      .set("Authorization", `Bearer ${owner.accessToken}`)
      .attach("avatar", testImagePath);

    expect(res.status).toBe(200);
    expect(res.body.profilePicture).toMatch(/^\/uploads\//);
  });

  it("should return 401 when unauthenticated", async () => {
    const res = await request(app)
      .post("/users/me/avatar");

    expect(res.status).toBe(401);
  });

  it("should return 400 when no file is attached", async () => {
    const res = await request(app)
      .post("/users/me/avatar")
      .set("Authorization", `Bearer ${owner.accessToken}`);

    expect(res.status).toBe(400);
  });
});

// ── GET /users/:id/posts ─────────────────────────────────────────────────────

describe("GET /users/:id/posts", () => {
  it("should return paginated posts by a specific user", async () => {
    const res = await request(app).get(`/users/${otherUser.userId}/posts`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.items)).toBe(true);
    expect(res.body.items.length).toBe(2);
    expect(typeof res.body.page).toBe("number");
    expect(typeof res.body.limit).toBe("number");
    expect(typeof res.body.hasMore).toBe("boolean");
  });

  it("should return empty items when the user has no posts", async () => {
    const res = await request(app).get(`/users/${owner.userId}/posts`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.items)).toBe(true);
    expect(res.body.items.length).toBe(0);
    expect(res.body.hasMore).toBe(false);
  });

  it("should respect page and limit query params", async () => {
    const res = await request(app).get(`/users/${otherUser.userId}/posts?page=1&limit=1`);

    expect(res.status).toBe(200);
    expect(res.body.items.length).toBe(1);
    expect(res.body.limit).toBe(1);
    expect(res.body.hasMore).toBe(true);
  });

  it("should return 400 for an invalid user ID format", async () => {
    const res = await request(app).get("/users/not-valid-id/posts");

    expect(res.status).toBe(400);
  });

  it("each post should have the author populated", async () => {
    const res = await request(app).get(`/users/${otherUser.userId}/posts`);

    expect(res.status).toBe(200);
    expect(res.body.items[0].author).toBeDefined();
    expect(res.body.items[0].author.username).toBeDefined();
  });
});
