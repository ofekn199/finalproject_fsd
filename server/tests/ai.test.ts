import request from "supertest";
import { Express } from "express";
import { describe, expect, it, jest, beforeEach } from "@jest/globals";

jest.mock("../src/services/ai.service", () => ({
  analyzePostWithAI: jest.fn(),
}));

jest.mock("../src/services/chess-ai.service", () => ({
  analyzeChessPosition: jest.fn(),
}));

import { createApp } from "../src/app";
import { analyzePostWithAI } from "../src/services/ai.service";
import { analyzeChessPosition } from "../src/services/chess-ai.service";

const app: Express = createApp();

const mockedAnalyzePostWithAI = analyzePostWithAI as jest.MockedFunction<
  typeof analyzePostWithAI
>;

const mockedAnalyzeChessPosition = analyzeChessPosition as jest.MockedFunction<
  typeof analyzeChessPosition
>;

beforeEach(() => {
  jest.clearAllMocks();
});

describe("POST /ai/analyze-post", () => {
  it("should return AI analysis result", async () => {
    mockedAnalyzePostWithAI.mockResolvedValue({
      summary: "A short summary",
      insight: "A useful insight",
      suggestion: "A suggested next step",
    });

    const res = await request(app).post("/ai/analyze-post").send({
      text: "White to play and win. What is the best move?",
      imageUrl: "/uploads/chess-position.png",
    });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      summary: "A short summary",
      insight: "A useful insight",
      suggestion: "A suggested next step",
    });

    expect(mockedAnalyzePostWithAI).toHaveBeenCalledTimes(1);
    expect(mockedAnalyzePostWithAI).toHaveBeenCalledWith({
      text: "White to play and win. What is the best move?",
      imageUrl: "/uploads/chess-position.png",
    });
  });

  it("should return 400 when text is missing", async () => {
    const res = await request(app).post("/ai/analyze-post").send({
      imageUrl: "/uploads/chess-position.png",
    });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Validation failed");
    expect(mockedAnalyzePostWithAI).not.toHaveBeenCalled();
  });

  it("should return 400 when text is empty", async () => {
    const res = await request(app).post("/ai/analyze-post").send({
      text: "   ",
    });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Validation failed");
    expect(mockedAnalyzePostWithAI).not.toHaveBeenCalled();
  });

  it("should return 400 when text is too long", async () => {
    const res = await request(app).post("/ai/analyze-post").send({
      text: "a".repeat(2001),
    });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Validation failed");
    expect(mockedAnalyzePostWithAI).not.toHaveBeenCalled();
  });

  it("should return 500 when AI service fails", async () => {
    mockedAnalyzePostWithAI.mockRejectedValue(new Error("AI service failed"));

    const res = await request(app).post("/ai/analyze-post").send({
      text: "Analyze this post",
    });

    expect(res.status).toBe(500);
    expect(res.body.message).toBeDefined();
    expect(mockedAnalyzePostWithAI).toHaveBeenCalledTimes(1);
  });
});

describe("POST /ai/analyze-chess", () => {
  it("should return chess analysis result", async () => {
    mockedAnalyzeChessPosition.mockResolvedValue({
      bestMove: "g5h7",
      evaluation: "Mate for White in 1",
      line: ["g5h7"],
    });

    const res = await request(app).post("/ai/analyze-chess").send({
      fen: "4kq2/pK3p2/p2Rp3/P3P1N1/8/8/6P1/8 w - - 0 1",
    });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      bestMove: "g5h7",
      evaluation: "Mate for White in 1",
      line: ["g5h7"],
    });

    expect(mockedAnalyzeChessPosition).toHaveBeenCalledTimes(1);
    expect(mockedAnalyzeChessPosition).toHaveBeenCalledWith({
      fen: "4kq2/pK3p2/p2Rp3/P3P1N1/8/8/6P1/8 w - - 0 1",
    });
  });

  it("should return 400 when fen is missing", async () => {
    const res = await request(app).post("/ai/analyze-chess").send({});

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Validation failed");
    expect(mockedAnalyzeChessPosition).not.toHaveBeenCalled();
  });

  it("should return 400 when fen is empty", async () => {
    const res = await request(app).post("/ai/analyze-chess").send({
      fen: "   ",
    });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Validation failed");
    expect(mockedAnalyzeChessPosition).not.toHaveBeenCalled();
  });

  it("should return 500 when chess analysis service fails", async () => {
    mockedAnalyzeChessPosition.mockRejectedValue(new Error("Invalid FEN"));

    const res = await request(app).post("/ai/analyze-chess").send({
      fen: "invalid-fen",
    });

    expect(res.status).toBe(500);
    expect(res.body.message).toBeDefined();
    expect(mockedAnalyzeChessPosition).toHaveBeenCalledTimes(1);
  });
});