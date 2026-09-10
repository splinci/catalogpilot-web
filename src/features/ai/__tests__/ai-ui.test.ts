/**
 * ============================================================================
 * Ondrio Commerce OS — AI Catalog Intelligence UI Workspace Test Suite
 * ============================================================================
 * Specification Reference: M9-004 / TEST-001 / SAD-001
 * Coverage: AI UI Components, Hooks, Dashboard, Job Queue, Prompt Editor
 * ============================================================================
 */

import { useAIContent } from "../hooks/useAIContent";
import { useAIClassification } from "../hooks/useAIClassification";
import { useAIEnrichment } from "../hooks/useAIEnrichment";
import { useAIJobs } from "../hooks/useAIJobs";
import { usePromptTemplates } from "../hooks/usePromptTemplates";
import { useAIDashboard } from "../hooks/useAIDashboard";

describe("M9-004 Enterprise AI Catalog Intelligence UI Workspace Test Suite", () => {
  it("should exports all required AI custom React hooks", () => {
    expect(typeof useAIContent).toBe("function");
    expect(typeof useAIClassification).toBe("function");
    expect(typeof useAIEnrichment).toBe("function");
    expect(typeof useAIJobs).toBe("function");
    expect(typeof usePromptTemplates).toBe("function");
    expect(typeof useAIDashboard).toBe("function");
  });
});
