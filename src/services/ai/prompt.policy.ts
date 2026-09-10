/**
 * ============================================================================
 * Ondrio Commerce OS — Prompt Policy Engine
 * ============================================================================
 * Specification Reference: M9-002 / BSD-009 / SAD-001
 * Business Rules: Prompt template validation, variable substitution, token estimation
 * ============================================================================
 */

export interface PromptResolutionResult {
  resolvedPrompt: string;
  substitutedVariables: string[];
  missingVariables: string[];
  estimatedTokens: number;
}

export class PromptPolicy {
  /**
   * Validate prompt template syntax and length.
   */
  validatePrompt(templateText: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!templateText || templateText.trim().length < 10) {
      errors.push("Prompt template text must be at least 10 characters.");
    }

    if (templateText.length > 10000) {
      errors.push("Prompt template exceeds maximum length of 10,000 characters.");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Extract and validate variable placeholders formatted as {{variableName}}.
   */
  validateVariables(templateText: string, providedVariables: Record<string, any>): {
    declaredVariables: string[];
    missingVariables: string[];
  } {
    const matches = templateText.match(/\{\{([a-zA-Z0-9_]+)\}\}/g) || [];
    const declaredVariables = Array.from(
      new Set(matches.map((m) => m.replace(/[\{\}]/g, "").trim()))
    );

    const missingVariables = declaredVariables.filter(
      (v) => providedVariables[v] === undefined || providedVariables[v] === null
    );

    return {
      declaredVariables,
      missingVariables,
    };
  }

  /**
   * Resolve template by substituting variable values.
   */
  resolveTemplate(templateText: string, variableValues: Record<string, any>): PromptResolutionResult {
    const { declaredVariables, missingVariables } = this.validateVariables(templateText, variableValues);

    let resolvedPrompt = templateText;
    const substitutedVariables: string[] = [];

    for (const key of declaredVariables) {
      if (variableValues[key] !== undefined && variableValues[key] !== null) {
        const val = String(variableValues[key]);
        resolvedPrompt = resolvedPrompt.replace(new RegExp(`\\{\\{${key}\\}\\}`, "g"), val);
        substitutedVariables.push(key);
      }
    }

    const estimatedTokens = this.estimateTokenUsage(resolvedPrompt);

    return {
      resolvedPrompt,
      substitutedVariables,
      missingVariables,
      estimatedTokens,
    };
  }

  /**
   * Validate prompt version increment logic.
   */
  validatePromptVersion(currentVersion: number, proposedVersion: number): boolean {
    return proposedVersion > currentVersion;
  }

  /**
   * Estimate token usage for prompt text (~4 chars per token average).
   */
  estimateTokenUsage(text: string): number {
    if (!text) return 0;
    return Math.ceil(text.length / 4);
  }
}
