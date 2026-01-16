import { Client } from "langsmith";
import type { Dataset, Example, Feedback } from "../types/langsmith.js";

export interface ExampleWithFeedback extends Example {
  feedback: Record<string, Feedback>;
}

export interface FeedbackResult {
  examples: ExampleWithFeedback[];
  feedbackKeys: string[];
}

interface Run {
  id: string;
  [key: string]: unknown;
}

const API_URL = "https://api.smith.langchain.com";

// Lazy singleton client instance
let client: Client | null = null;

export function getClient(): Client {
  if (!client) {
    const workspaceId = process.env.LANGSMITH_WORKSPACE_ID;
    if (!workspaceId) {
      throw new Error("LANGSMITH_WORKSPACE_ID not set");
    }
    client = new Client({
      webUrl: "https://smith.langchain.com",
      apiUrl: API_URL,
      workspaceId,
    });
  }
  return client;
}

// Direct API call to list runs by reference example IDs
// SDK v0.4.7 has a bug where it sends reference_example as string instead of array
async function listRunsByReferenceExamples(exampleIds: string[]): Promise<Run[]> {
  const apiKey = process.env.LANGSMITH_API_KEY;
  if (!apiKey) {
    throw new Error("LANGSMITH_API_KEY not set");
  }

  const response = await fetch(`${API_URL}/runs/query`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
    },
    body: JSON.stringify({
      reference_example: exampleIds,
      select: ["id", "reference_example_id"],
      limit: 100,
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Failed to fetch runs: ${response.status} ${text}`);
  }

  const data = await response.json();
  return data.runs ?? [];
}

// Helper to collect async iterables into arrays
async function collect<T>(iterable: AsyncIterable<T>): Promise<T[]> {
  const items: T[] = [];
  for await (const item of iterable) {
    items.push(item);
  }
  return items;
}

export async function listDatasets(): Promise<Dataset[]> {
  return collect(getClient().listDatasets());
}

export async function getDataset(datasetId: string): Promise<Dataset> {
  return getClient().readDataset({ datasetId });
}

export interface PaginatedExamples {
  examples: Example[];
  total: number;
  limit: number;
  offset: number;
}

export interface PaginationParams {
  limit?: number;
  offset?: number;
}

export async function listExamples(
  datasetId: string,
  params?: PaginationParams
): Promise<PaginatedExamples> {
  const limit = params?.limit ?? 20;
  const offset = params?.offset ?? 0;

  // Get total count from dataset
  const dataset = await getDataset(datasetId);
  const total = dataset.example_count ?? 0;

  // Fetch paginated examples
  const examples = await collect(
    getClient().listExamples({ datasetId, limit, offset })
  );

  return { examples, total, limit, offset };
}

export async function listFeedbackForDataset(
  datasetId: string
): Promise<FeedbackResult> {
  const client = getClient();
  // Fetch all examples (no pagination) for feedback - uses high limit
  const allExamples = await collect(client.listExamples({ datasetId }));
  const examples = allExamples;

  // Collect all run IDs by example using direct API call
  // SDK v0.4.7 has a bug where it sends reference_example as string instead of array
  const exampleIds = examples.map((e) => e.id);
  const runs = exampleIds.length ? await listRunsByReferenceExamples(exampleIds) : [];

  // Build example -> runIds mapping from run.reference_example_id
  const exampleRunMap = new Map<string, string[]>();
  const allRunIds: string[] = [];

  for (const run of runs) {
    const refExampleId = (run as { reference_example_id?: string }).reference_example_id;
    if (refExampleId) {
      const existing = exampleRunMap.get(refExampleId) ?? [];
      existing.push(run.id);
      exampleRunMap.set(refExampleId, existing);
      allRunIds.push(run.id);
    }
  }

  // Fetch all feedback in one batch
  const feedbackItems = allRunIds.length
    ? await collect(client.listFeedback({ runIds: allRunIds }))
    : [];

  // Create run -> feedback mapping
  const runFeedbackMap = new Map<string, Feedback[]>();
  for (const fb of feedbackItems) {
    const existing = runFeedbackMap.get(fb.run_id) ?? [];
    existing.push(fb);
    runFeedbackMap.set(fb.run_id, existing);
  }

  // Collect unique feedback keys
  const feedbackKeySet = new Set<string>();
  for (const fb of feedbackItems) {
    feedbackKeySet.add(fb.key);
  }

  // Build examples with feedback - aggregate by key using most recent feedback
  const examplesWithFeedback: ExampleWithFeedback[] = examples.map((example) => {
    const runIds = exampleRunMap.get(example.id) ?? [];
    const feedback: Record<string, Feedback> = {};

    for (const runId of runIds) {
      const feedbackList = runFeedbackMap.get(runId) ?? [];
      for (const fb of feedbackList) {
        // Keep the most recent feedback for each key
        if (!feedback[fb.key] || fb.created_at > feedback[fb.key].created_at) {
          feedback[fb.key] = fb;
        }
      }
    }

    return { ...example, feedback };
  });

  return {
    examples: examplesWithFeedback,
    feedbackKeys: Array.from(feedbackKeySet).sort(),
  };
}
