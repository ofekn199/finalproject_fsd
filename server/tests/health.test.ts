import request from "supertest";
import { createApp } from "../src/app";

describe("Health API", () => {
  it("should return status ok", async () => {
    const app = createApp();

    const res = await request(app).get("/health");

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: "ok" });
  });
});