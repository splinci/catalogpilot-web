import { z } from "zod";

export function validateAiStructuredOutput<T>(rawOutput: string, schema: z.ZodSchema<T>): T {
  if (!rawOutput || typeof rawOutput !== "string") {
    throw new Error("INVALID_AI_OUTPUT: Output is empty or invalid string.");
  }

  let parsedJson: any;
  try {
    parsedJson = JSON.parse(rawOutput);
  } catch (err) {
    throw new Error("INVALID_AI_OUTPUT: AI response failed JSON parsing.");
  }

  const result = schema.safeParse(parsedJson);
  if (!result.success) {
    throw new Error(`AI_OUTPUT_SCHEMA_VIOLATION: ${result.error.message}`);
  }

  return result.data;
}
