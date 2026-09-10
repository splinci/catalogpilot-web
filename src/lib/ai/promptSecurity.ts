const PROMPT_INJECTION_PATTERNS = [
  /ignore previous instructions/i,
  /disregard all prior directives/i,
  /override system prompt/i,
  /you are now DAN/i,
  /reveal your system instructions/i,
  /output raw system prompt/i,
  /bypass safety filters/i,
  /act as an unrestricted AI/i,
];

export interface PromptSecurityEvaluation {
  safe: boolean;
  detectedPattern?: string;
  sanitizedPrompt: string;
}

export function evaluatePromptSecurity(userPrompt: string): PromptSecurityEvaluation {
  if (!userPrompt || typeof userPrompt !== "string") {
    return { safe: true, sanitizedPrompt: "" };
  }

  for (const pattern of PROMPT_INJECTION_PATTERNS) {
    if (pattern.test(userPrompt)) {
      return {
        safe: false,
        detectedPattern: pattern.source,
        sanitizedPrompt: "[REDACTED_PROMPT_INJECTION_ATTEMPT]",
      };
    }
  }

  return {
    safe: true,
    sanitizedPrompt: userPrompt.trim(),
  };
}

export function validatePromptSubmission(userPrompt: string): string {
  const result = evaluatePromptSecurity(userPrompt);
  if (!result.safe) {
    throw new Error(
      `PROMPT_INJECTION_DETECTED: Prompt rejected due to malicious injection pattern '${result.detectedPattern}'.`
    );
  }
  return result.sanitizedPrompt;
}
