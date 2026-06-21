import { describe, expect, it } from "vitest";
import {
  DEFAULT_AUTO_COMMIT_CONFIDENCE_THRESHOLD,
  evaluateAutoCommitEligibility,
} from "@/services/upload/auto-commit-rules";

const baseInput = {
  classification: "inventory_sheet",
  overallConfidence: 0.9,
  entityCount: 3,
  validationIssues: [] as Array<{ type: string; severity: string }>,
  aiSettings: {
    autoCommitEnabled: true,
    autoCommitConfidenceThreshold: DEFAULT_AUTO_COMMIT_CONFIDENCE_THRESHOLD,
  },
};

describe("auto-commit-rules", () => {
  it("allows auto-commit when all checks pass", () => {
    const result = evaluateAutoCommitEligibility(baseInput);
    expect(result.eligible).toBe(true);
    expect(result.reasons).toHaveLength(0);
  });

  it("blocks when auto-commit is disabled", () => {
    const result = evaluateAutoCommitEligibility({
      ...baseInput,
      aiSettings: { autoCommitEnabled: false, autoCommitConfidenceThreshold: 0.85 },
    });
    expect(result.eligible).toBe(false);
    expect(result.reasons.some((reason) => reason.includes("disabled"))).toBe(true);
  });

  it("blocks critical validation issues", () => {
    const result = evaluateAutoCommitEligibility({
      ...baseInput,
      validationIssues: [{ type: "inventory_conflict", severity: "critical" }],
    });
    expect(result.eligible).toBe(false);
    expect(result.reasons.some((reason) => reason.includes("Critical"))).toBe(true);
  });

  it("blocks duplicate uploads", () => {
    const result = evaluateAutoCommitEligibility({
      ...baseInput,
      validationIssues: [{ type: "duplicate_upload", severity: "warning" }],
    });
    expect(result.eligible).toBe(false);
    expect(result.reasons.some((reason) => reason.includes("Duplicate"))).toBe(true);
  });

  it("blocks unknown classification", () => {
    const result = evaluateAutoCommitEligibility({
      ...baseInput,
      classification: "unknown",
    });
    expect(result.eligible).toBe(false);
  });

  it("blocks when no entities extracted", () => {
    const result = evaluateAutoCommitEligibility({
      ...baseInput,
      entityCount: 0,
    });
    expect(result.eligible).toBe(false);
  });

  it("blocks when confidence is below threshold", () => {
    const result = evaluateAutoCommitEligibility({
      ...baseInput,
      overallConfidence: 0.5,
    });
    expect(result.eligible).toBe(false);
    expect(result.reasons.some((reason) => reason.includes("confidence"))).toBe(true);
  });

  it("normalizes percentage confidence values", () => {
    const result = evaluateAutoCommitEligibility({
      ...baseInput,
      overallConfidence: 90,
    });
    expect(result.eligible).toBe(true);
  });

  it("allows warning-only validation issues", () => {
    const result = evaluateAutoCommitEligibility({
      ...baseInput,
      validationIssues: [{ type: "cost_outlier", severity: "warning" }],
    });
    expect(result.eligible).toBe(true);
  });
});
