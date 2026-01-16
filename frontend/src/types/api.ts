export interface Dataset {
  id: string;
  name: string;
  description: string;
  tenant_id: string;
  data_type?: "kv" | "llm" | "chat";
  created_at: string;
  modified_at: string;
  example_count?: number;
  session_count?: number;
}

export interface Example {
  id: string;
  dataset_id: string;
  inputs: Record<string, unknown>;
  outputs?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  created_at: string;
  modified_at?: string;
  source_run_id?: string;
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

export interface ApiError {
  error: string;
}

export interface Feedback {
  id: string;
  run_id: string;
  key: string;
  score: number | null;
  value: unknown;
  comment: string | null;
  created_at: string;
}

export interface ExampleWithFeedback extends Example {
  feedback: Record<string, Feedback>;
}

export interface FeedbackResult {
  examples: ExampleWithFeedback[];
  feedbackKeys: string[];
}

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

export interface AppConfig {
  langsmith: {
    workspaceId: string | null;
    baseUrl: string;
  };
}

// Prompt Hub types
export interface PromptSummary {
  id: string;
  name: string;
  description: string | null;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ModelConfig {
  model?: string;
  params?: Record<string, unknown>;
}

export interface PromptDetails {
  name: string;
  messages: Message[];
  description: string | null;
  tags: string[];
  readme: string | null;
  modelConfig?: ModelConfig;
}

export interface AlignmentDetails {
  datasetName: string;
  targetColumn: string;
  alignedCount: number;
  totalCount: number;
}

export interface PushPromptRequest {
  name: string;
  messages: Message[];
  description?: string;
  tags?: string[];
  alignmentScore?: number;
  alignmentDetails?: AlignmentDetails;
}
