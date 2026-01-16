// Re-export types from langsmith SDK
export type {
  Dataset,
  Example,
  Feedback,
  FeedbackConfig,
  KVMap,
} from "langsmith/schemas";

// Prompt Hub types
export interface PromptSummary {
  id: string;
  name: string;
  description: string | null;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface PromptMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface ModelConfig {
  model?: string;
  params?: Record<string, unknown>;
}

export interface PromptDetails {
  name: string;
  messages: PromptMessage[];
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
  messages: PromptMessage[];
  description?: string;
  tags?: string[];
  alignmentScore?: number;
  alignmentDetails?: AlignmentDetails;
}
