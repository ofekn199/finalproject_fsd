import { api } from "../api/axios";

export interface AIAnalysis {
  summary: string;
  insight: string;
  suggestion: string;
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