import { Client } from "langsmith";
import type { Prompt, PromptCommit } from "langsmith/schemas";
import type {
  Dataset,
  Example,
  Feedback,
  PromptSummary,
  PromptDetails,
  PromptMessage,
  PushPromptRequest,
  ModelConfig,
} from "../types/langsmith.js";
import { AVAILABLE_MODELS } from "./llm.js";

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

// Prompt Hub functions

function promptToSummary(prompt: Prompt): PromptSummary {
  return {
    id: prompt.id,
    name: prompt.full_name,
    description: prompt.description ?? null,
    tags: prompt.tags,
    createdAt: prompt.created_at,
    updatedAt: prompt.updated_at,
  };
}

// LangChain manifest message type
type LangChainManifestMessage = {
  lc?: number;
  type?: string;
  id?: string[];
  kwargs?: {
    prompt?: {
      kwargs?: {
        template?: string;
      };
    };
    content?: string;
  };
};

function manifestToMessages(manifest: Record<string, unknown>): PromptMessage[] {
  const messages: PromptMessage[] = [];

  // Handle ChatPromptTemplate format from LangChain
  // With includeModel=true, manifest is a RunnableSequence: kwargs.first.kwargs.messages
  // Without includeModel, manifest is a ChatPromptTemplate: kwargs.messages
  const kwargs = manifest.kwargs as {
    messages?: LangChainManifestMessage[];
    first?: { kwargs?: { messages?: LangChainManifestMessage[] } };
  } | undefined;
  const promptMessages = kwargs?.first?.kwargs?.messages ?? kwargs?.messages;

  if (Array.isArray(promptMessages)) {
    for (const msg of promptMessages) {
      // Get the type from the id array (e.g., ["langchain", "prompts", "chat", "SystemMessagePromptTemplate"])
      const typeId = msg.id?.[3] ?? "";
      let role: PromptMessage["role"] = "user";
      if (typeId.includes("System")) {
        role = "system";
      } else if (typeId.includes("AI") || typeId.includes("Assistant")) {
        role = "assistant";
      } else if (typeId.includes("Human") || typeId.includes("User")) {
        role = "user";
      }

      // Content is at kwargs.prompt.kwargs.template or kwargs.content
      let content = "";
      if (msg.kwargs?.prompt?.kwargs?.template) {
        content = msg.kwargs.prompt.kwargs.template;
      } else if (typeof msg.kwargs?.content === "string") {
        content = msg.kwargs.content;
      }

      messages.push({ role, content });
    }
  }

  return messages;
}

function messagesToManifest(messages: PromptMessage[]): Record<string, unknown> {
  return {
    lc: 1,
    type: "constructor",
    id: ["langchain", "prompts", "chat", "ChatPromptTemplate"],
    kwargs: {
      messages: messages.map((msg) => {
        let id: string[];
        if (msg.role === "system") {
          id = ["langchain", "prompts", "chat", "SystemMessagePromptTemplate"];
        } else if (msg.role === "assistant") {
          id = ["langchain", "prompts", "chat", "AIMessagePromptTemplate"];
        } else {
          id = ["langchain", "prompts", "chat", "HumanMessagePromptTemplate"];
        }
        return {
          lc: 1,
          type: "constructor",
          id,
          kwargs: {
            prompt: {
              lc: 1,
              type: "constructor",
              id: ["langchain", "prompts", "prompt", "PromptTemplate"],
              kwargs: {
                template: msg.content,
                input_variables: extractVariables(msg.content),
                template_format: "f-string",
              },
            },
          },
        };
      }),
      input_variables: extractAllVariables(messages),
    },
  };
}

function extractVariables(content: string): string[] {
  // Extract variables in {variable} format (LangChain style)
  const matches = content.match(/\{([^{}]+)\}/g) ?? [];
  return [...new Set(matches.map((m) => m.slice(1, -1)))];
}

function extractAllVariables(messages: PromptMessage[]): string[] {
  const allVars = messages.flatMap((m) => extractVariables(m.content));
  return [...new Set(allVars)];
}

function mapToSupportedModel(name: string): string | undefined {
  if (AVAILABLE_MODELS.includes(name)) return name;
  const lower = name.toLowerCase();
  return AVAILABLE_MODELS.find((m) => lower.includes(m.toLowerCase()));
}

function extractModelConfig(manifest: Record<string, unknown>): ModelConfig | undefined {
  const kwargs = manifest.kwargs as Record<string, unknown> | undefined;
  if (!kwargs) return undefined;

  // When includeModel=true, manifest is a RunnableSequence with model at kwargs.last.kwargs.bound.kwargs
  const last = kwargs.last as Record<string, unknown> | undefined;
  const bound = (last?.kwargs as Record<string, unknown> | undefined)?.bound as Record<string, unknown> | undefined;
  const boundKwargs = bound?.kwargs as Record<string, unknown> | undefined;

  if (boundKwargs) {
    const modelName = boundKwargs.model;
    // Extract model params like temperature, max_tokens, etc.
    const params: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(boundKwargs)) {
      if (key !== "model" && key !== "openai_api_key" && key !== "extra_headers" && key !== "service_tier") {
        params[key] = value;
      }
    }

    return {
      model: typeof modelName === "string" ? mapToSupportedModel(modelName) : undefined,
      params: Object.keys(params).length > 0 ? params : undefined,
    };
  }

  // Fallback: check for ls_ prefixed params (legacy format)
  const modelName = kwargs.ls_model_name ?? kwargs.model_name ?? kwargs.model;
  const params: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(kwargs)) {
    if (key.startsWith("ls_") && key !== "ls_model_name" && key !== "ls_provider" && key !== "ls_model_type") {
      params[key.replace("ls_", "")] = value;
    }
  }

  if (!modelName && Object.keys(params).length === 0) return undefined;

  return {
    model: typeof modelName === "string" ? mapToSupportedModel(modelName) : undefined,
    params: Object.keys(params).length > 0 ? params : undefined,
  };
}

export async function listPrompts(): Promise<PromptSummary[]> {
  const prompts = await collect(getClient().listPrompts({ isPublic: false }));
  return prompts.map(promptToSummary);
}

export async function pullPrompt(name: string): Promise<PromptDetails> {
  const client = getClient();
  const prompt = await client.getPrompt(name);
  if (!prompt) {
    throw new Error(`Prompt not found: ${name}`);
  }

  // Use includeModel: true to get model config in the manifest
  const commit = await client.pullPromptCommit(name, { includeModel: true });
  const messages = manifestToMessages(commit.manifest);

  return {
    name: prompt.full_name,
    messages,
    description: prompt.description ?? null,
    tags: prompt.tags,
    readme: prompt.readme ?? null,
    modelConfig: extractModelConfig(commit.manifest),
  };
}

export async function pushPrompt(request: PushPromptRequest): Promise<string> {
  const client = getClient();
  const { name, messages, tags = [], alignmentScore, alignmentDetails } = request;

  // Use provided description or generate fallback from alignment data
  let description = request.description;
  if (!description && alignmentScore !== undefined && alignmentDetails) {
    description = `${Math.round(alignmentScore)}% aligned on ${alignmentDetails.datasetName} (${alignmentDetails.targetColumn})`;
  }

  // Build tags with alignment score
  const allTags = [...tags];
  if (alignmentScore !== undefined) {
    allTags.push(`alignment:${Math.round(alignmentScore)}%`);
  }

  // Build readme with alignment details
  let readme = "";
  if (alignmentDetails) {
    readme = `## Alignment Score: ${Math.round(alignmentScore ?? 0)}%\n\n`;
    readme += `- Dataset: ${alignmentDetails.datasetName}\n`;
    readme += `- Target: ${alignmentDetails.targetColumn}\n`;
    readme += `- Aligned: ${alignmentDetails.alignedCount}/${alignmentDetails.totalCount} examples\n`;
  }

  // Convert messages to LangChain manifest format
  const manifest = messagesToManifest(messages);

  // Push the prompt
  const url = await client.pushPrompt(name, {
    object: manifest,
    description,
    readme: readme || undefined,
    tags: allTags.length > 0 ? allTags : undefined,
  });

  return url;
}
