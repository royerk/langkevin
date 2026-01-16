import type {
  Dataset,
  ApiError,
  FeedbackResult,
  EvaluationRequest,
  EvaluationResponse,
  PaginatedExamples,
  PaginationParams,
} from "../types/api";

const API_BASE = "/api";

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error: ApiError = await response.json();
    throw new Error(error.error || "An unknown error occurred");
  }
  return response.json();
}

export async function fetchDatasets(): Promise<Dataset[]> {
  const response = await fetch(`${API_BASE}/datasets`);
  return handleResponse<Dataset[]>(response);
}

export async function fetchDataset(datasetId: string): Promise<Dataset> {
  const response = await fetch(`${API_BASE}/datasets/${datasetId}`);
  return handleResponse<Dataset>(response);
}

export async function fetchExamples(
  datasetId: string,
  params?: PaginationParams
): Promise<PaginatedExamples> {
  const searchParams = new URLSearchParams();
  if (params?.limit !== undefined) {
    searchParams.set("limit", String(params.limit));
  }
  if (params?.offset !== undefined) {
    searchParams.set("offset", String(params.offset));
  }
  const query = searchParams.toString();
  const url = `${API_BASE}/datasets/${datasetId}/examples${query ? `?${query}` : ""}`;
  const response = await fetch(url);
  return handleResponse<PaginatedExamples>(response);
}

export async function fetchFeedback(datasetId: string): Promise<FeedbackResult> {
  const response = await fetch(`${API_BASE}/datasets/${datasetId}/feedback`);
  return handleResponse<FeedbackResult>(response);
}

export async function fetchModels(): Promise<string[]> {
  const response = await fetch(`${API_BASE}/evaluation/models`);
  const result = await handleResponse<{ models: string[] }>(response);
  return result.models;
}

export async function runEvaluation(
  request: EvaluationRequest
): Promise<EvaluationResponse> {
  const response = await fetch(`${API_BASE}/evaluation/run`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  });
  return handleResponse<EvaluationResponse>(response);
}
