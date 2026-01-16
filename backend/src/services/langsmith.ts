import { Client } from "langsmith";
import type { Dataset, Example } from "../types/langsmith.js";

// Shared client instance (reads LANGSMITH_API_KEY from env)
export const client = new Client();

// Helper to collect async iterables into arrays
async function collect<T>(iterable: AsyncIterable<T>): Promise<T[]> {
  const items: T[] = [];
  for await (const item of iterable) {
    items.push(item);
  }
  return items;
}

export async function listDatasets(): Promise<Dataset[]> {
  return collect(client.listDatasets());
}

export async function getDataset(datasetId: string): Promise<Dataset> {
  return client.readDataset({ datasetId });
}

export async function listExamples(datasetId: string): Promise<Example[]> {
  return collect(client.listExamples({ datasetId }));
}
