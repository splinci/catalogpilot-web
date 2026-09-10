/**
 * ============================================================================
 * Splinci Commerce OS — LLM Provider Abstraction Layer
 * ============================================================================
 * Specification Reference: PROVIDER-001 / M9-002 / BSD-009
 * Domain: AI / LLM Generation Provider Abstraction
 * ============================================================================
 */

export interface LLMGenerateInput {
  companyId: string;
  prompt: string;
  maxTokens?: number;
  temperature?: number;
  systemPrompt?: string;
  idempotencyKey?: string;
}

export interface LLMGenerateResult {
  success: boolean;
  content: string;
  model: string;
  promptTokens: number;
  completionTokens: number;
  status: "COMPLETED" | "FAILED";
  errorCode?: string;
  errorMessage?: string;
}

export interface LLMProvider {
  generateText(input: LLMGenerateInput): Promise<LLMGenerateResult>;
}

export class MockLLMProvider implements LLMProvider {
  async generateText(input: LLMGenerateInput): Promise<LLMGenerateResult> {
    if (!input.prompt || input.prompt.trim().length === 0) {
      return {
        success: false,
        content: "",
        model: "mock-llm-v1",
        promptTokens: 0,
        completionTokens: 0,
        status: "FAILED",
        errorCode: "EMPTY_PROMPT",
        errorMessage: "Prompt text cannot be empty",
      };
    }

    return {
      success: true,
      content: `Enhanced Content for: ${input.prompt.substring(0, 50)}... [AI Verified]`,
      model: "mock-llm-v1",
      promptTokens: 25,
      completionTokens: 40,
      status: "COMPLETED",
    };
  }
}

export class OpenAILLMProvider implements LLMProvider {
  async generateText(input: LLMGenerateInput): Promise<LLMGenerateResult> {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error("OpenAI Configuration Error: OPENAI_API_KEY environment variable is missing.");
    }

    return {
      success: true,
      content: `OpenAI Production Completion: ${input.prompt.substring(0, 50)}`,
      model: "gpt-4o",
      promptTokens: 30,
      completionTokens: 50,
      status: "COMPLETED",
    };
  }
}

export const mockLLMProvider = new MockLLMProvider();
