# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Is

LangKevin is a web application for aligning LLM-as-a-judge prompts against human feedback in LangSmith datasets. Users write evaluator prompts, run them against datasets, and see how well their LLM evaluator matches human judgments.

## Commands

```bash
# Install dependencies (uses Bun workspaces)
bun install

# Development - run both frontend and backend
bun run dev

# Development - run individually
bun run dev:backend    # Express on port 3001
bun run dev:frontend   # Vite on port 5173

# Build
bun run build

# Lint
bun run lint
```

## Architecture

Monorepo with two workspaces:

- **frontend/** - React 19 + TypeScript + Vite + Tailwind CSS
- **backend/** - Express + TypeScript (tsx for dev)

Backend serves API routes under `/api`. Frontend communicates with backend for LangSmith data fetching and LLM evaluation.

### Key Backend Components (planned)
- LangSmith API integration for dataset access
- LLM Router supporting OpenAI, Anthropic, Gemini via Vercel AI SDK
- Handlebars template engine for prompt variables
- Metrics calculation for alignment scoring

## Application Flow

### Screen 1: Dataset Selection
- Left sidebar: List of datasets with name, description, example count, and data type badge
- Right panel: Preview of selected dataset's examples (inputs/outputs in collapsible JSON tree)
- Action: "Start Aligning" button to proceed to alignment screen

### Screen 2: Alignment Editor
Split into two resizable panels:

**Top Panel - Prompt Editor:**
- System prompt textarea (pre-populated or empty)
- Message list with + button to add Human/Assistant messages
- Each message has role selector and content textarea
- Variables from dataset examples can be inserted via template syntax (e.g., `{{input.query}}`)

**Bottom Panel - Alignment Table:**
| Input (compact) | Output (compact) | Feedback Col 1 | Feedback Col 2 | ... | Evaluator Output | Aligned? |
|-----------------|------------------|----------------|----------------|-----|------------------|----------|
| {input preview} | {output preview} | human score    | human label    | ... | LLM score (hover for reasoning) | ✓/✗ |

- Columns are dynamically generated from feedback keys present in the dataset
- One feedback column must be selected as the "target" for alignment comparison
- Evaluator Output column shows the LLM judge's result after running
- Aligned? column indicates if evaluator matches target feedback

**Navigation:**
- Back button to return to dataset selection
- Run Evaluation button to execute prompt against all examples

### Environment Variables
```
LANGSMITH_API_KEY
OPENAI_API_KEY
ANTHROPIC_API_KEY
GOOGLE_AI_API_KEY
```
