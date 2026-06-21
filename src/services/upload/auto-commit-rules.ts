import type { AiSettings } from "@/types/settings";

export const DEFAULT_AUTO_COMMIT_CONFIDENCE_THRESHOLD = 0.85;

export interface AutoCommitValidationIssue {
  type: string;
  severity: string;
}

export interface AutoCommitInput {
  classification: string;
  overallConfidence: number;
  entityCount: number;
  validationIssues: AutoCommitValidationIssue[];
  aiSettings: Pick<AiSettings, "autoCommitEnabled" | "autoCommitConfidenceThreshold">;
}

export interface AutoCommitEligibilityResult {
  eligible: boolean;
  reasons: string[];
}

function normalizeConfidence(confidence: number): number {
  return confidence > 1 ? confidence / 100 : confidence;
}

export function evaluateAutoCommitEligibility(
  input: AutoCommitInput,
): AutoCommitEligibilityResult {
  const reasons: string[] = [];
  const threshold =
    input.aiSettings.autoCommitConfidenceThreshold ?? DEFAULT_AUTO_COMMIT_CONFIDENCE_THRESHOLD;
  const confidence = normalizeConfidence(input.overallConfidence);

  if (input.aiSettings.autoCommitEnabled === false) {
    reasons.push("Auto-commit is disabled for this organization.");
  }

  if (input.classification === "unknown") {
    reasons.push("Document classification is unknown.");
  }

  if (input.entityCount === 0) {
    reasons.push("No structured entities were extracted.");
  }

  if (confidence < threshold) {
    reasons.push(
      `Overall confidence ${confidence.toFixed(2)} is below threshold ${threshold.toFixed(2)}.`,
    );
  }

  for (const issue of input.validationIssues) {
    if (issue.severity === "critical") {
      reasons.push(`Critical validation issue: ${issue.type}.`);
    }
    if (issue.type === "duplicate_upload") {
      reasons.push("Duplicate upload detected.");
    }
  }

  return {
    eligible: reasons.length === 0,
    reasons,
  };
}
