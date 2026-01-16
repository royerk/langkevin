import type { ExampleWithFeedback, ScoreConfig, EvaluationResponse } from "../types/api";

/**
 * Get unique values from a feedback column
 */
export function getUniqueValuesForColumn(
  examples: ExampleWithFeedback[],
  feedbackKey: string
): string[] {
  const values = new Set<string>();
  for (const example of examples) {
    const feedback = example.feedback[feedbackKey];
    if (feedback) {
      const value = feedback.value ?? feedback.score;
      if (value !== null && value !== undefined) {
        values.add(String(value));
      }
    }
  }
  return Array.from(values).sort();
}

/**
 * Get min and max values from a numeric feedback column
 */
export function getMinMaxForColumn(
  examples: ExampleWithFeedback[],
  feedbackKey: string
): { min: number; max: number } {
  let min = Infinity;
  let max = -Infinity;
  for (const example of examples) {
    const feedback = example.feedback[feedbackKey];
    if (feedback) {
      const value = feedback.score ?? feedback.value;
      if (typeof value === "number") {
        min = Math.min(min, value);
        max = Math.max(max, value);
      }
    }
  }
  // Default to 0-10 if no numeric values found
  if (min === Infinity) min = 0;
  if (max === -Infinity) max = 10;
  return { min, max };
}

/**
 * Infer score config type from column data
 */
export function inferScoreConfig(
  examples: ExampleWithFeedback[],
  feedbackKey: string
): ScoreConfig {
  const values: unknown[] = [];
  for (const example of examples) {
    const feedback = example.feedback[feedbackKey];
    if (feedback) {
      const value = feedback.value ?? feedback.score;
      if (value !== null && value !== undefined) {
        values.push(value);
      }
    }
  }

  if (values.length === 0) {
    return { type: "continuous", min: 0, max: 10 };
  }

  // Check if all values are boolean
  const booleanValues = values.filter(
    (v) => v === true || v === false || v === "true" || v === "false"
  );
  if (booleanValues.length === values.length) {
    return { type: "boolean" };
  }

  // Check if all values are numeric
  const numericValues = values.filter((v) => typeof v === "number");
  if (numericValues.length === values.length) {
    const nums = numericValues as number[];
    const min = Math.min(...nums);
    const max = Math.max(...nums);
    // Check if values are just 0 and 1 - treat as boolean
    const uniqueNums = new Set(nums);
    if (
      uniqueNums.size <= 2 &&
      Array.from(uniqueNums).every((n) => n === 0 || n === 1)
    ) {
      return { type: "boolean" };
    }
    return { type: "continuous", min: Math.floor(min), max: Math.ceil(max) };
  }

  // Otherwise treat as categories
  const categories = getUniqueValuesForColumn(examples, feedbackKey);
  return { type: "categories", categories };
}

/**
 * Check if evaluator output aligns with target feedback, handling type coercion
 */
export function checkAlignment(
  evalScore: EvaluationResponse["score"],
  targetScore: unknown,
  config: ScoreConfig
): boolean {
  if (evalScore === null || evalScore === undefined) return false;
  if (targetScore === null || targetScore === undefined) return false;

  // For boolean type, handle coercion between boolean/number/string
  if (config.type === "boolean") {
    const evalBool = normalizeToBool(evalScore);
    const targetBool = normalizeToBool(targetScore);
    return evalBool === targetBool;
  }

  // For continuous type, compare as numbers
  if (config.type === "continuous") {
    const evalNum = typeof evalScore === "number" ? evalScore : parseFloat(String(evalScore));
    const targetNum = typeof targetScore === "number" ? targetScore : parseFloat(String(targetScore));
    if (isNaN(evalNum) || isNaN(targetNum)) return false;
    return evalNum === targetNum;
  }

  // For categories, compare as strings
  if (config.type === "categories") {
    return String(evalScore) === String(targetScore);
  }

  return false;
}

function normalizeToBool(value: unknown): boolean | null {
  if (typeof value === "boolean") return value;
  if (value === 1 || value === "1" || value === "true") return true;
  if (value === 0 || value === "0" || value === "false") return false;
  return null;
}
