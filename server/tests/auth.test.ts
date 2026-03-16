import request from "supertest";
import { createApp } from "../src/app";

describe("Auth API", () => {
  const app = createApp();

  it("should fail when register body is invalid", async () => {
    const res = await request(app).post("/auth/register").send({
      username: "ab",
      email: "not-an-email",
      password: "123",
    });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Validation failed");
  });

  it("should register a new user", async () => {
    const res = await request(app).post("/auth/register").send({
      username: "ofek_test",
      email: "ofek_test@example.com",
      password: "Pass1234!",
    });

    expect(res.status).toBe(201);
    expect(res.body.username).toBe("ofek_test");
    expect(res.body.email).toBe("ofek_test@example.com");
    expect(res.body.password).toBeUndefined();
  });

  it("should not allow duplicate username", async () => {
    await request(app).post("/auth/register").send({
      username: "duplicate_user",
      email: "first@example.com",
      password: "Pass1234!",
    });

    const res = await request(app).post("/auth/register").send({
      username: "duplicate_user",
      email: "second@example.com",
      password: "Pass1234!",
    });

    expect(res.status).toBe(409);
    expect(res.body.message).toBe("Username already exists");
  });

  it("should login and return tokens", async () => {
    await request(app).post("/auth/register").send({
      username: "login_user",
      email: "login_user@example.com",
      password: "Pass1234!",
    });

    const res = await request(app).post("/auth/login").send({
      username: "login_user",
      password: "Pass1234!",
    });

    expect(res.status).toBe(200);
    expect(res.body.accessToken).toBeDefined();
    expect(res.body.refreshToken).toBeDefined();
  });

  it("should reject invalid credentials", async () => {
    await request(app).post("/auth/register").send({
      username: "wrong_pass_user",
      email: "wrong_pass@example.com",
      password: "Pass1234!",
    });

    const res = await request(app).post("/auth/login").send({
      username: "wrong_pass_user",
      password: "WrongPass999",
    });

    expect(res.status).toBe(401);
    expect(res.body.message).toBe("Invalid credentials");
  });

  it("should refresh tokens", async () => {
  await request(app).post("/auth/register").send({
    username: "refresh_user",
    email: "refresh_user@example.com",
    password: "Pass1234!",
  });

  const loginRes = await request(app).post("/auth/login").send({
    username: "refresh_user",
    password: "Pass1234!",
  });

  const refreshRes = await request(app).post("/auth/refresh").send({
    refreshToken: loginRes.body.refreshToken,
  });

  expect(refreshRes.status).toBe(200);
  expect(refreshRes.body.accessToken).toBeDefined();
  expect(refreshRes.body.refreshToken).toBeDefined();
  expect(refreshRes.body.refreshToken).not.toBe(loginRes.body.refreshToken);
});

it("should logout user with valid access token", async () => {
  await request(app).post("/auth/register").send({
    username: "logout_user",
    email: "logout_user@example.com",
    password: "Pass1234!",
  });

  const loginRes = await request(app).post("/auth/login").send({
    username: "logout_user",
    password: "Pass1234!",
  });

  const logoutRes = await request(app)
    .post("/auth/logout")
    .set("Authorization", `Bearer ${loginRes.body.accessToken}`);

  expect(logoutRes.status).toBe(200);
  expect(logoutRes.body.message).toBe("Logged out");
});

it("should reject logout without token", async () => {
  const res = await request(app).post("/auth/logout");

  expect(res.status).toBe(401);
  expect(res.body.message).toBe("Missing access token");
});

  
});

