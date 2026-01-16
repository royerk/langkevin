import { Router } from "express";
import {
  listDatasets,
  getDataset,
  listExamples,
  listFeedbackForDataset,
} from "../services/langsmith.js";

const router = Router();

// GET /api/datasets - List all datasets
router.get("/datasets", async (_req, res) => {
  try {
    const datasets = await listDatasets();
    res.json(datasets);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    res.status(500).json({ error: message });
  }
});

// GET /api/datasets/:id - Get single dataset
router.get("/datasets/:id", async (req, res) => {
  try {
    const dataset = await getDataset(req.params.id);
    res.json(dataset);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    res.status(500).json({ error: message });
  }
});

// GET /api/datasets/:id/examples - Get examples for a dataset
router.get("/datasets/:id/examples", async (req, res) => {
  try {
    // Parse pagination params
    const limitStr = req.query.limit as string | undefined;
    const offsetStr = req.query.offset as string | undefined;

    const limit = limitStr ? parseInt(limitStr, 10) : undefined;
    const offset = offsetStr ? parseInt(offsetStr, 10) : undefined;

    // Validate params
    if (limit !== undefined && (isNaN(limit) || limit < 1 || limit > 100)) {
      res.status(400).json({ error: "limit must be between 1 and 100" });
      return;
    }
    if (offset !== undefined && (isNaN(offset) || offset < 0)) {
      res.status(400).json({ error: "offset must be a non-negative integer" });
      return;
    }

    const result = await listExamples(req.params.id, { limit, offset });
    res.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    res.status(500).json({ error: message });
  }
});

// GET /api/datasets/:id/feedback - Get examples with feedback for a dataset
router.get("/datasets/:id/feedback", async (req, res) => {
  try {
    const result = await listFeedbackForDataset(req.params.id);
    res.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    res.status(500).json({ error: message });
  }
});

export default router;
