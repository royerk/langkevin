import { Client } from "langsmith";
import type { Dataset, Example, Feedback } from "../types/langsmith.js";

export interface ExampleWithFeedback extends Example {
  feedback: Record<string, Feedback>;
}

export interface FeedbackResult {
  examples: ExampleWithFeedback[];
  feedbackKeys: string[];
}

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
      apiUrl: "https://api.smith.langchain.com",
      workspaceId,
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
  const allExamples = await collect(client.listExamples({ datasetId }));

  // Get source_run_ids from examples (runs where human annotations are attached)
  // When manually annotating in LangSmith UI, feedback is attached to the source run
  const sourceRunIds = allExamples
    .map((e) => e.source_run_id)
    .filter((id): id is string => id != null);

  // Map source_run_id back to example
  const sourceRunToExample = new Map<string, string>();
  for (const example of allExamples) {
    if (example.source_run_id) {
      sourceRunToExample.set(example.source_run_id, example.id);
    }
  }

  // Fetch all feedback for source runs
  const feedbackItems = sourceRunIds.length
    ? await collect(client.listFeedback({ runIds: sourceRunIds }))
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

  // Build examples with feedback from source runs
  const examplesWithFeedback: ExampleWithFeedback[] = allExamples.map((example) => {
    const feedback: Record<string, Feedback> = {};

    if (example.source_run_id) {
      const sourceFeedback = runFeedbackMap.get(example.source_run_id) ?? [];
      for (const fb of sourceFeedback) {
        // Keep most recent feedback for each key
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
