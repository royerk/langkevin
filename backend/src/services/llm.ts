import { generateText, generateObject } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { createAnthropic } from "@ai-sdk/anthropic";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { z } from "zod";

export interface Message {
  role: "system" | "user" | "assistant";
  content: string;
}

export type ScoreConfig =
  | { type: "boolean" }
  | { type: "categories"; categories: string[] }
  | { type: "continuous"; min: number; max: number };

export interface EvaluationRequest {
  messages: Message[];
  model: string;
  variables: Record<string, unknown>;
  scoreConfig?: ScoreConfig;
}

export interface EvaluationResponse {
  score: number | boolean | string | null;
  reasoning: string;
  raw: string;
}

// Model registry mapping model names to providers
const MODEL_PROVIDERS: Record<string, "openai" | "anthropic" | "google"> = {
  "gpt-4o": "openai",
  "gpt-4o-mini": "openai",
  "gpt-4-turbo": "openai",
  "claude-3-5-sonnet-20241022": "anthropic",
  "claude-3-5-haiku-20241022": "anthropic",
  "claude-3-opus-20240229": "anthropic",
  "gemini-1.5-pro": "google",
  "gemini-1.5-flash": "google",
  "gemini-2.0-flash-exp": "google",
};

export const AVAILABLE_MODELS = Object.keys(MODEL_PROVIDERS);

function getModelInstance(modelName: string) {
  const provider = MODEL_PROVIDERS[modelName];
  if (!provider) {
    throw new Error(`Unknown model: ${modelName}`);
  }

  switch (provider) {
    case "openai": {
      const openai = createOpenAI({ apiKey: process.env.OPENAI_API_KEY });
      return openai(modelName);
    }
    case "anthropic": {
      const anthropic = createAnthropic({
        apiKey: process.env.ANTHROPIC_API_KEY,
      });
      return anthropic(modelName);
    }
    case "google": {
      const google = createGoogleGenerativeAI({
        apiKey: process.env.GOOGLE_AI_API_KEY,
      });
      return google(modelName);
    }
  }
}

// Replace template variables like {{inputs.query}} with actual values
function substituteVariables(
  template: string,
  variables: Record<string, unknown>
): string {
  return template.replace(/\{\{([^}]+)\}\}/g, (_, path) => {
    const keys = path.trim().split(".");
    let value: unknown = variables;
    for (const key of keys) {
      if (value && typeof value === "object" && key in value) {
        value = (value as Record<string, unknown>)[key];
      } else {
        return `{{${path}}}`; // Keep original if path not found
      }
    }
    if (typeof value === "object") {
      return JSON.stringify(value);
    }
    return String(value ?? "");
  });
}

// Build Zod schema based on score configuration
function buildScoreSchema(config: ScoreConfig) {
  switch (config.type) {
    case "boolean":
      return z.object({
        score: z.boolean(),
        reasoning: z.string(),
      });
    case "categories":
      return z.object({
        score: z.enum(config.categories as [string, ...string[]]),
        reasoning: z.string(),
      });
    case "continuous":
      return z.object({
        score: z.number().int().min(config.min).max(config.max),
        reasoning: z.string(),
      });
  }
}

// Parse the response to extract score and reasoning
function parseEvaluationResponse(text: string): {
  score: number | null;
  reasoning: string;
} {
  // Try to find a score pattern like "Score: 5" or "5/10" or just a number
  const scorePatterns = [
    /\bscore[:\s]+(\d+(?:\.\d+)?)/i,
    /\b(\d+(?:\.\d+)?)\s*\/\s*\d+/,
    /\*\*(\d+(?:\.\d+)?)\*\*/,
    /^(\d+(?:\.\d+)?)$/m,
  ];

  let score: number | null = null;
  for (const pattern of scorePatterns) {
    const match = text.match(pattern);
    if (match) {
      score = parseFloat(match[1]);
      break;
    }
  }

  // Extract reasoning - everything except the score line if found
  let reasoning = text;
  if (score !== null) {
    reasoning = text
      .replace(/\bscore[:\s]+\d+(?:\.\d+)?/gi, "")
      .replace(/\b\d+(?:\.\d+)?\s*\/\s*\d+/g, "")
      .trim();
  }

  return { score, reasoning };
}

export async function runEvaluation(
  request: EvaluationRequest
): Promise<EvaluationResponse> {
  const model = getModelInstance(request.model);

  // Process messages with variable substitution
  const processedMessages = request.messages.map((msg) => ({
    role: msg.role,
    content: substituteVariables(msg.content, request.variables),
  }));

  // Use structured output when scoreConfig is provided
  if (request.scoreConfig) {
    const schema = buildScoreSchema(request.scoreConfig);
    const { object } = await generateObject({
      model,
      messages: processedMessages,
      schema,
    });

    return {
      score: object.score,
      reasoning: object.reasoning,
      raw: JSON.stringify(object),
    };
  }

  // Fall back to text parsing for backward compatibility
  const { text } = await generateText({
    model,
    messages: processedMessages,
  });

  const { score, reasoning } = parseEvaluationResponse(text);

  return {
    score,
    reasoning,
    raw: text,
  };
}
