/**
 * Like API Tests — TDD
 *
 * POST /posts/:id/like  — toggles like on/off for the authenticated user
 *
 * Each test that depends on specific like state creates its own fresh post
 * to avoid cross-test state pollution.
 */

import request from "supertest";
import { createApp } from "../src/app";
import { Express } from "express";
import { registerAndLogin, createPost, TestUser } from "./helpers";
import mongoose from "mongoose";

const app: Express = createApp();

let owner: TestUser;
let otherUser: TestUser;

beforeAll(async () => {
  owner = await registerAndLogin(app);
  otherUser = await registerAndLogin(app);
});

describe("POST /posts/:id/like", () => {
  it("should like a post and return liked=true with incremented likesCount", async () => {
    const post = await createPost(app, owner.accessToken, { text: "Post for like test" });

    const res = await request(app)
      .post(`/posts/${post._id}/like`)
      .set("Authorization", `Bearer ${owner.accessToken}`);

    expect(res.status).toBe(200);
    expect(res.body.liked).toBe(true);
    expect(res.body.likesCount).toBe(1);
  });

  it("should unlike a post (toggle) and return liked=false with decremented likesCount", async () => {
    const post = await createPost(app, owner.accessToken, { text: "Post for unlike test" });

    // Like first
    await request(app)
      .post(`/posts/${post._id}/like`)
      .set("Authorization", `Bearer ${owner.accessToken}`);

    // Unlike (second call toggles off)
    const res = await request(app)
      .post(`/posts/${post._id}/like`)
      .set("Authorization", `Bearer ${owner.accessToken}`);

    expect(res.status).toBe(200);
    expect(res.body.liked).toBe(false);
    expect(res.body.likesCount).toBe(0);
  });

  it("should allow two different users to like the same post independently", async () => {
    const post = await createPost(app, owner.accessToken, { text: "Post for two-user like test" });

    await request(app)
      .post(`/posts/${post._id}/like`)
      .set("Authorization", `Bearer ${owner.accessToken}`);

    const res = await request(app)
      .post(`/posts/${post._id}/like`)
      .set("Authorization", `Bearer ${otherUser.accessToken}`);

    expect(res.status).toBe(200);
    expect(res.body.liked).toBe(true);
    expect(res.body.likesCount).toBe(2);
  });

  it("should return 401 when unauthenticated", async () => {
    const post = await createPost(app, owner.accessToken, { text: "Post for 401 test" });

    const res = await request(app).post(`/posts/${post._id}/like`);

    expect(res.status).toBe(401);
  });

  it("should return 404 for a non-existent post", async () => {
    const fakeId = new mongoose.Types.ObjectId().toString();
    const res = await request(app)
      .post(`/posts/${fakeId}/like`)
      .set("Authorization", `Bearer ${owner.accessToken}`);

    expect(res.status).toBe(404);
  });

  it("should return 400 for an invalid post ID format", async () => {
    const res = await request(app)
      .post("/posts/not-a-valid-id/like")
      .set("Authorization", `Bearer ${owner.accessToken}`);

    expect(res.status).toBe(400);
  });
});
