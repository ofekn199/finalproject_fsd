import request from "supertest";
import { createApp } from "../src/app";

describe("Auth API validation", () => {
  it("should fail when register body is invalid", async () => {
    const app = createApp();

    const res = await request(app).post("/auth/register").send({
      username: "ab",
      email: "not-an-email",
      password: "123",
    });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Validation failed");
  });
});