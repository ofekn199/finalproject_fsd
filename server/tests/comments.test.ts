import request from "supertest";
import mongoose from "mongoose";
import { Express } from "express";
import { beforeAll, describe, expect, it } from "@jest/globals";
import { createApp } from "../src/app";
import {
  registerAndLogin,
  createPost,
  createComment,
  TestUser,
  TestPost,
} from "./helpers";

const app: Express = createApp();

let owner: TestUser;
let otherUser: TestUser;
let seedPost: TestPost;

beforeAll(async () => {
  owner = await registerAndLogin(app);
  otherUser = await registerAndLogin(app);

  seedPost = await createPost(app, owner.accessToken, {
    text: "Post for comment tests",
  });
});

describe("GET /posts/:id/comments", () => {
  it("should return an empty array when a post has no comments", async () => {
    const newPost = await createPost(app, owner.accessToken, {
      text: "Post without comments",
    });

    const res = await request(app).get(`/posts/${newPost._id}/comments`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body).toHaveLength(0);
  });

  it("should return comments for a post", async () => {
    await createComment(app, owner.accessToken, seedPost._id, {
      text: "First comment",
    });

    await createComment(app, otherUser.accessToken, seedPost._id, {
      text: "Second comment",
    });

    const res = await request(app).get(`/posts/${seedPost._id}/comments`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThanOrEqual(2);

    expect(res.body[0]).toHaveProperty("_id");
    expect(res.body[0]).toHaveProperty("text");
    expect(res.body[0]).toHaveProperty("author");
  });

  it("should return comments sorted by newest first", async () => {
    const sortablePost = await createPost(app, owner.accessToken, {
      text: "Sorting comments post",
    });

    await createComment(app, owner.accessToken, sortablePost._id, {
      text: "Older comment",
    });

    await new Promise((resolve) => setTimeout(resolve, 20));

    await createComment(app, owner.accessToken, sortablePost._id, {
      text: "Newer comment",
    });

    const res = await request(app).get(`/posts/${sortablePost._id}/comments`);

    expect(res.status).toBe(200);
    expect(res.body[0].text).toBe("Newer comment");
    expect(res.body[1].text).toBe("Older comment");
  });

  it("should return 404 for a non-existing post", async () => {
    const fakeId = new mongoose.Types.ObjectId().toString();

    const res = await request(app).get(`/posts/${fakeId}/comments`);

    expect(res.status).toBe(404);
    expect(res.body.message).toBe("Post not found");
  });

  it("should return 400 for an invalid post id", async () => {
    const res = await request(app).get("/posts/not-a-valid-id/comments");

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Invalid post ID");
  });
});

describe("POST /posts/:id/comments", () => {
  it("should create a comment for an authenticated user", async () => {
    const res = await request(app)
      .post(`/posts/${seedPost._id}/comments`)
      .set("Authorization", `Bearer ${owner.accessToken}`)
      .send({ text: "Created from test" });

    expect(res.status).toBe(201);
    expect(res.body._id).toBeDefined();
    expect(res.body.text).toBe("Created from test");
    expect(res.body.author).toBeDefined();
  });

  it("should increment the post commentsCount after creating a comment", async () => {
    const countPost = await createPost(app, owner.accessToken, {
      text: "Count comment post",
    });

    const beforeRes = await request(app).get(`/posts/${countPost._id}`);
    expect(beforeRes.status).toBe(200);
    expect(beforeRes.body.commentsCount).toBe(0);

    await request(app)
      .post(`/posts/${countPost._id}/comments`)
      .set("Authorization", `Bearer ${owner.accessToken}`)
      .send({ text: "Increment counter" });

    const afterRes = await request(app).get(`/posts/${countPost._id}`);
    expect(afterRes.status).toBe(200);
    expect(afterRes.body.commentsCount).toBe(1);
  });

  it("should return 401 when no token is provided", async () => {
    const res = await request(app)
      .post(`/posts/${seedPost._id}/comments`)
      .send({ text: "Unauthorized comment" });

    expect(res.status).toBe(401);
    expect(res.body.message).toBe("Missing access token");
  });

  it("should return 400 when comment text is missing", async () => {
    const res = await request(app)
      .post(`/posts/${seedPost._id}/comments`)
      .set("Authorization", `Bearer ${owner.accessToken}`)
      .send({});

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Validation failed");
  });

  it("should return 400 when comment text is empty", async () => {
    const res = await request(app)
      .post(`/posts/${seedPost._id}/comments`)
      .set("Authorization", `Bearer ${owner.accessToken}`)
      .send({ text: "   " });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Validation failed");
  });

  it("should return 400 when comment text is too long", async () => {
    const res = await request(app)
      .post(`/posts/${seedPost._id}/comments`)
      .set("Authorization", `Bearer ${owner.accessToken}`)
      .send({ text: "a".repeat(301) });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Validation failed");
  });

  it("should return 404 for a non-existing post", async () => {
    const fakeId = new mongoose.Types.ObjectId().toString();

    const res = await request(app)
      .post(`/posts/${fakeId}/comments`)
      .set("Authorization", `Bearer ${owner.accessToken}`)
      .send({ text: "Comment on missing post" });

    expect(res.status).toBe(404);
    expect(res.body.message).toBe("Post not found");
  });

  it("should return 400 for an invalid post id", async () => {
    const res = await request(app)
      .post("/posts/not-a-valid-id/comments")
      .set("Authorization", `Bearer ${owner.accessToken}`)
      .send({ text: "Invalid post id" });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Invalid post ID");
  });
});