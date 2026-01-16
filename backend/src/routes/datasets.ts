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
    const examples = await listExamples(req.params.id);
    res.json(examples);
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
