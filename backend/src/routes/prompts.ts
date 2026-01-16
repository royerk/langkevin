import { Router } from "express";
import {
  listPrompts,
  pullPrompt,
  pushPrompt,
} from "../services/langsmith.js";
import type { PushPromptRequest } from "../types/langsmith.js";

const router = Router();

// GET /api/prompts - List all workspace prompts
router.get("/prompts", async (_req, res) => {
  try {
    const prompts = await listPrompts();
    res.json(prompts);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    res.status(500).json({ error: message });
  }
});

// GET /api/prompts/:name - Pull a specific prompt by name
router.get("/prompts/:name(*)", async (req, res) => {
  try {
    const prompt = await pullPrompt(req.params.name);
    res.json(prompt);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    const status = message.includes("not found") ? 404 : 500;
    res.status(status).json({ error: message });
  }
});

// POST /api/prompts - Push/save a prompt
router.post("/prompts", async (req, res) => {
  try {
    const request = req.body as PushPromptRequest;

    // Validate required fields
    if (!request.name || typeof request.name !== "string") {
      res.status(400).json({ error: "name is required" });
      return;
    }
    if (!Array.isArray(request.messages) || request.messages.length === 0) {
      res.status(400).json({ error: "messages array is required" });
      return;
    }

    const url = await pushPrompt(request);
    res.json({ url });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    res.status(500).json({ error: message });
  }
});

export default router;
