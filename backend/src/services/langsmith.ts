import { Client } from "langsmith";
import type { Dataset, Example, Feedback } from "../types/langsmith.js";

export interface ExampleWithFeedback extends Example {
  feedback: Record<string, Feedback>;
}

export interface FeedbackResult {
  examples: ExampleWithFeedback[];
  feedbackKeys: string[];
}

const WORKSPACE_ID = "a9dc4931-9737-494b-85d5-0f57a7e694dd";

// Lazy singleton client instance
let client: Client | null = null;

export function getClient(): Client {
  if (!client) {
    client = new Client({
      webUrl: "https://smith.langchain.com",
      apiUrl: "https://api.smith.langchain.com",
      workspaceId: WORKSPACE_ID,
    });
  }
  return client;
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

export async function listExamples(datasetId: string): Promise<Example[]> {
  return collect(getClient().listExamples({ datasetId }));
}

export async function listFeedbackForDataset(
  datasetId: string
): Promise<FeedbackResult> {
  const client = getClient();
  const examples = await listExamples(datasetId);

  // Collect all run IDs by example
  const exampleRunMap = new Map<string, string[]>();
  const allRunIds: string[] = [];

  // For each example, get runs that reference it
  await Promise.all(
    examples.map(async (example) => {
      const runs = await collect(
        client.listRuns({ referenceExampleId: example.id, limit: 100 })
      );
      const runIds = runs.map((r) => r.id);
      exampleRunMap.set(example.id, runIds);
      allRunIds.push(...runIds);
    })
  );

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
