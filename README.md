# LangKevin

Because my name ain't Smith.

## What This Is

A web application for aligning LLM-as-a-judge prompts against human feedback in LangSmith datasets. Write a prompt, run it against your dataset, and see how well your LLM evaluator matches human judgments—with metrics and per-row reasoning to help you iterate.

## Problem Statement

When building LLM evaluators, you want them to match human judgment. But iterating on evaluator prompts is tedious:
- Pull data from LangSmith
- Run your prompt manually
- Compare outputs to human feedback
- Repeat

LangKevin streamlines this loop into a single interface.

## Quick Start

```bash
# Install dependencies (uses Bun)
bun install

# Set up environment variables
cp .env.example .env  # then edit with your API keys

# Run both frontend and backend
bun run dev
```

Open http://localhost:5173 in your browser.

### Run individually
```bash
bun run dev:backend    # Express API on port 3001
bun run dev:frontend   # Vite dev server on port 5173
```

## MVP Features

1. **Connect to LangSmith** - Authenticate and browse available datasets
2. **Select a dataset** - View rows with their existing feedback
3. **Choose target feedback** - Pick which feedback field to align against (other feedback fields available as prompt variables)
4. **Write evaluator prompt** - Compose multi-message prompts (system/user/assistant) using Handlebars syntax to reference row data
5. **Select model** - Choose from OpenAI, Anthropic, or Google Gemini
6. **Run batch evaluation** - Execute prompt against all rows
7. **View results** - Aggregated metrics + per-row reasoning for debugging

## Supported Feedback Types

| Type | Description | Alignment Metric |
|------|-------------|------------------|
| Boolean | true/false | Accuracy |
| Score | Integer min-max range | Confusion matrix |
| Categorical | Predefined set of labels | Confusion matrix |

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend                             │
│                    (React + TypeScript)                     │
├─────────────────────────────────────────────────────────────┤
│  Dataset Picker │ Prompt Editor │ Results View │ Row Detail │
└────────┬────────┴───────┬───────┴──────┬───────┴─────┬──────┘
         │                │              │             │
         ▼                ▼              ▼             ▼
┌─────────────────────────────────────────────────────────────┐
│                        Backend                              │
│                   (Node.js + Express)                       │
├─────────────────────────────────────────────────────────────┤
│  LangSmith API  │  LLM Router   │  Prompt Engine │  Metrics │
│   (datasets)    │ (multi-model) │  (Handlebars)  │  (stats) │
└────────┬────────┴───────┬───────┴────────────────┴──────────┘
         │                │
         ▼                ▼
   ┌───────────┐   ┌─────────────────────────┐
   │ LangSmith │   │      LLM Providers      │
   │    API    │   │ OpenAI│Anthropic│Gemini │
   └───────────┘   └─────────────────────────┘
```

## User Flow

```
┌──────────────┐    ┌────────────────┐    ┌─────────────────┐
│ 1. Connect   │───▶│ 2. Pick Dataset│───▶│ 3. Select       │
│    LangSmith │    │    & Feedback  │    │    Feedback Type│
└──────────────┘    └────────────────┘    └────────┬────────┘
                                                   │
                                                   ▼
┌──────────────┐    ┌────────────────┐    ┌─────────────────┐
│ 6. Iterate   │◀───│ 5. View        │◀───│ 4. Write Prompt │
│    & Refine  │    │    Results     │    │    & Run        │
└──────────────┘    └────────────────┘    └─────────────────┘
```

## Prompt Editor

Multi-message prompt composition with OpenAI-style roles:

```
┌─────────────────────────────────────────────────┐
│ [+ System] [+ User] [+ Assistant]               │
├─────────────────────────────────────────────────┤
│ ┌─ System ─────────────────────────────────┐    │
│ │ You are an evaluator. Score the response │    │
│ │ for helpfulness from {{min}} to {{max}}. │    │
│ └───────────────────────────────────────────┘   │
│ ┌─ User ───────────────────────────────────┐    │
│ │ Input: {{input}}                         │    │
│ │ Response: {{output}}                     │    │
│ │ Previous rating: {{feedback.quality}}    │    │
│ └───────────────────────────────────────────┘   │
├─────────────────────────────────────────────────┤
│ Available variables: input, output, feedback.*, │
│ reference, metadata.*                           │
└─────────────────────────────────────────────────┘
```

## Structured Output

Using Vercel AI SDK's `generateObject`, the LLM response is constrained to a schema based on the selected feedback type:

```typescript
// Boolean feedback
{ value: boolean, reasoning: string }

// Score feedback (e.g., 1-5)
{ value: number, reasoning: string }  // validated against min/max

// Categorical feedback (e.g., ["good", "bad", "neutral"])
{ value: "good" | "bad" | "neutral", reasoning: string }  // enum from config
```

## Feedback Configuration

After selecting a feedback field to align against, user must configure the type:

| Type | Configuration Required |
|------|----------------------|
| Boolean | None (fixed true/false) |
| Score | Min value, Max value (integers) |
| Categorical | List of valid categories |

## Template Variables

Handlebars variables are flattened from the LangSmith example structure:

```handlebars
{{inputs.question}}      <!-- from example.inputs.question -->
{{outputs.answer}}       <!-- from example.outputs.answer -->
{{feedback.accuracy}}    <!-- from example feedback (other fields, not target) -->
{{reference}}            <!-- reference output if present -->
{{metadata.source}}      <!-- from example.metadata -->
```

## Error Handling

During batch evaluation:
- If a row fails (API error, parsing error, timeout), mark it as **failed** and continue
- Failed rows shown separately in results with error message
- Aggregate metrics calculated only from successful rows

## Results View

### Aggregate Metrics
- **Boolean**: Accuracy percentage, true/false positive rates
- **Score/Categorical**: Confusion matrix heatmap

### Per-Row Detail
Each row shows:
- Original input/output
- Human feedback value
- LLM predicted value
- LLM reasoning (extracted from response)
- Match status (correct/incorrect)

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React, TypeScript, Vite |
| Styling | Tailwind CSS |
| Backend | Node.js, Express, TypeScript |
| LLM Integration | Vercel AI SDK (`generateObject`) |
| Template Engine | Handlebars |
| LangSmith | langsmith SDK |

## Environment Variables

```
LANGSMITH_API_KEY=your-langsmith-api-key
OPENAI_API_KEY=your-openai-api-key
ANTHROPIC_API_KEY=your-anthropic-api-key
GOOGLE_AI_API_KEY=your-gemini-api-key
```

## Backlog (Future Work)

### Prompt Management
- [ ] Load prompts from LangSmith prompt registry
- [ ] Save prompts to LangSmith prompt registry
- [ ] Iteration history with diff view
- [ ] Compare results across prompt versions

### Feedback Types
- [ ] Decimal scores (float values)
- [ ] Free-text feedback alignment
- [ ] Multi-label tags
- [ ] Composite scores (multiple dimensions)

### Advanced Features
- [ ] Align against multiple feedback fields simultaneously
- [ ] Export evaluation results
- [ ] Prompt templates library
- [ ] Cost estimation before running batch
- [ ] Auto-detect feedback type config from existing data (suggest min/max, infer categories)

### UX Improvements
- [ ] Streaming results as they complete
- [ ] Row sampling for quick iteration
- [ ] Syntax highlighting in prompt editor
- [ ] Variable autocomplete
