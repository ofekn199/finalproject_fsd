import { api } from "../api/axios";

export interface AIAnalysis {
  summary: string;
  insight: string;
  suggestion: string;
}

export interface ChessAnalysis {
  bestMove: string;
  evaluation: string;
  line: string[];
}

export const analyzePost = async (
  text: string,
  imageUrl?: string
): Promise<AIAnalysis> => {
  const res = await api.post("/ai/analyze-post", {
    text,
    imageUrl,
  });

  return res.data;
};

export const analyzeChess = async (
  fen: string
): Promise<ChessAnalysis> => {
  const res = await api.post("/ai/analyze-chess", {
    fen,
  });

  return res.data;
};