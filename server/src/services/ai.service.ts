import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface AnalyzePostInput {
  text: string;
  imageUrl?: string;
}

export interface AnalyzePostResult {
  summary: string;
  insight: string;
  suggestion: string;
}

/**
 * analyzePostWithAI
 * Analyzes a social post and returns a short summary, insight, and suggestion.
 */
export async function analyzePostWithAI(
  input: AnalyzePostInput
): Promise<AnalyzePostResult> {
  const prompt = `
You are an AI assistant for ArenaX, a gaming and tournament social platform.

Analyze the following post and return:
1. A short summary
2. A useful insight
3. A suggested response or next step

Post text:
"${input.text}"

Return the result as valid JSON with this exact shape:
{
  "summary": "...",
  "insight": "...",
  "suggestion": "..."
}
`;

  const response = await client.responses.create({
    model: "gpt-4.1-mini",
    input: prompt,
  });

  const rawText = response.output_text?.trim();

  if (!rawText) {
    throw new Error("AI returned an empty response");
  }

  let parsed: AnalyzePostResult;

  try {
    parsed = JSON.parse(rawText) as AnalyzePostResult;
  } catch {
    throw new Error("Failed to parse AI response as JSON");
  }

  return {
    summary: parsed.summary ?? "",
    insight: parsed.insight ?? "",
    suggestion: parsed.suggestion ?? "",
  };
}