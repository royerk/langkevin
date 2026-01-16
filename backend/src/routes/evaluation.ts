import { Router } from "express";
import {
  runEvaluation,
  AVAILABLE_MODELS,
  type EvaluationRequest,
} from "../services/llm.js";

const router = Router();

// GET /api/evaluation/models - List available models
router.get("/evaluation/models", (_req, res) => {
  res.json({ models: AVAILABLE_MODELS });
});

// Validate scoreConfig structure
function isValidScoreConfig(
  config: unknown
): config is EvaluationRequest["scoreConfig"] {
  if (!config) return true; // Optional field
  if (typeof config !== "object") return false;
  const c = config as Record<string, unknown>;
  if (c.type === "boolean") return true;
  if (c.type === "categories") {
    return Array.isArray(c.categories) && c.categories.every((v) => typeof v === "string");
  }
  if (c.type === "continuous") {
    return typeof c.min === "number" && typeof c.max === "number";
  }
  return false;
}

// POST /api/evaluation/run - Run evaluation with given prompt and variables
router.post("/evaluation/run", async (req, res) => {
  try {
    const { messages, model, variables, scoreConfig } =
      req.body as EvaluationRequest;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "messages array is required" });
    }
    if (!model || typeof model !== "string") {
      return res.status(400).json({ error: "model string is required" });
    }
    if (!variables || typeof variables !== "object") {
      return res.status(400).json({ error: "variables object is required" });
    }
    if (!isValidScoreConfig(scoreConfig)) {
      return res.status(400).json({ error: "invalid scoreConfig" });
    }

    const result = await runEvaluation({ messages, model, variables, scoreConfig });
    res.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    res.status(500).json({ error: message });
  }
});

export default router;
