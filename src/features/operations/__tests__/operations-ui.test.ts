/**
 * ============================================================================
 * Splinci Commerce OS — Operations UI Workspace Test Suite
 * ============================================================================
 * Specification Reference: M12-004 / TEST-001 / UI-001 / SEC-001
 * Coverage: Operations Hooks, Components, UI Security, Architectural Isolation
 * ============================================================================
 */

import { describe, it, expect } from "vitest";
import * as hooks from "../hooks";
import fs from "fs";
import path from "path";

describe("M12-004 Enterprise Operations UI Workspace Test Suite", () => {
  describe("1. Custom React Hooks Export Verification", () => {
    it("should export all 7 custom Operations React hooks", () => {
      expect(typeof hooks.useOperationsHealth).toBe("function");
      expect(typeof hooks.useOperationsIncidents).toBe("function");
      expect(typeof hooks.useOperationsMetrics).toBe("function");
      expect(typeof hooks.useOutboxOperations).toBe("function");
      expect(typeof hooks.useSystemSettings).toBe("function");
      expect(typeof hooks.useOperationsNotifications).toBe("function");
      expect(typeof hooks.useOperationsAnalytics).toBe("function");
    });
  });

  describe("2. UI Architectural Isolation & Security Rules", () => {
    it("should verify 0 Prisma, 0 Repository, and 0 Service imports in src/features/operations/", () => {
      const featuresOpsDir = path.join(process.cwd(), "src", "features", "operations");

      function getTsFiles(dir: string): string[] {
        const entries = fs.readdirSync(dir, { withFileTypes: true });
        let files: string[] = [];
        for (const entry of entries) {
          const res = path.resolve(dir, entry.name);
          if (entry.isDirectory()) {
            if (entry.name !== "__tests__") {
              files = files.concat(getTsFiles(res));
            }
          } else if (entry.isFile() && (entry.name.endsWith(".ts") || entry.name.endsWith(".tsx"))) {
            files.push(res);
          }
        }
        return files;
      }

      const files = getTsFiles(featuresOpsDir);
      expect(files.length).toBeGreaterThan(10);

      for (const filePath of files) {
        const content = fs.readFileSync(filePath, "utf-8");
        expect(content).not.toContain("@prisma/client");
        expect(content).not.toContain("repositories/");
        expect(content).not.toContain("services/operations");
        expect(content).not.toContain("prisma.");
      }
    });

    it("should verify 0 Prisma, 0 Repository, and 0 Service imports in src/app/(app)/operations/", () => {
      const appOpsDir = path.join(process.cwd(), "src", "app", "(protected)", "operations");

      function getTsFiles(dir: string): string[] {
        const entries = fs.readdirSync(dir, { withFileTypes: true });
        let files: string[] = [];
        for (const entry of entries) {
          const res = path.resolve(dir, entry.name);
          if (entry.isDirectory()) {
            if (entry.name !== "__tests__") {
              files = files.concat(getTsFiles(res));
            }
          } else if (entry.isFile() && (entry.name.endsWith(".ts") || entry.name.endsWith(".tsx"))) {
            files.push(res);
          }
        }
        return files;
      }

      const files = getTsFiles(appOpsDir);
      expect(files.length).toBeGreaterThan(5);

      for (const filePath of files) {
        const content = fs.readFileSync(filePath, "utf-8");
        expect(content).not.toContain("@prisma/client");
        expect(content).not.toContain("repositories/");
        expect(content).not.toContain("services/operations");
        expect(content).not.toContain("prisma.");
      }
    });
  });

  describe("3. Static Networking Encapsulation Verification", () => {
    it("should verify zero direct fetch() calls in presentation components", () => {
      const componentsDir = path.join(process.cwd(), "src", "features", "operations", "components");

      const entries = fs.readdirSync(componentsDir, { withFileTypes: true });
      for (const entry of entries) {
        if (entry.isFile() && entry.name.endsWith(".tsx")) {
          const content = fs.readFileSync(path.join(componentsDir, entry.name), "utf-8");
          expect(content).not.toContain("fetch(");
        }
      }
    });
  });
});
