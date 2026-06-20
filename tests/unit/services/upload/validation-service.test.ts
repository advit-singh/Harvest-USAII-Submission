import { afterEach, describe, expect, it, vi, type Mock } from "vitest";

import { validateUpload } from "@/services/upload/validation-service";
import { createValidationAnomaly, findUploadByChecksum } from "@/services/upload/upload-service";

vi.mock("@/services/upload/upload-service", () => ({
  createValidationAnomaly: vi.fn(),
  findUploadByChecksum: vi.fn(),
}));

const mockedCreateValidationAnomaly = createValidationAnomaly as unknown as Mock;
const mockedFindUploadByChecksum = findUploadByChecksum as unknown as Mock;

describe("validateUpload", () => {
  afterEach(() => {
    vi.resetAllMocks();
  });

  it("persists missing-field warnings for unknown classification and short content", async () => {
    mockedFindUploadByChecksum.mockResolvedValue(null);
    mockedCreateValidationAnomaly.mockImplementation(async (_, type, severity, reason, confidence, suggestedFix) => ({
      id: `anomaly-${type}`,
      type,
      severity,
      reason,
      confidence,
      suggested_fix: suggestedFix,
    }));

    const issues = await validateUpload(
      "upl-test",
      "org-test",
      "checksum-test",
      {
        classification: "unknown",
        rawText: "short",
      },
    );

    expect(issues).toHaveLength(2);
    expect(issues[0]).toMatchObject({ type: "missing_field", severity: "warning" });
    expect(issues[1]).toMatchObject({ type: "missing_field", severity: "informational" });
    expect(createValidationAnomaly).toHaveBeenCalledTimes(2);
  });

  it("creates a duplicate_upload anomaly when an upload with the same checksum exists", async () => {
    mockedFindUploadByChecksum.mockResolvedValue({ id: "existing-upload" });
    mockedCreateValidationAnomaly.mockResolvedValue({
      id: "anomaly-duplicate_upload",
      type: "duplicate_upload",
      severity: "warning",
      reason: expect.any(String),
      confidence: 85,
      suggested_fix: expect.any(String),
    });

    const issues = await validateUpload(
      "upl-test",
      "org-test",
      "checksum-test",
      {
        classification: "receipt",
        rawText: "This is a normal sized upload content sample that is longer than twenty characters.",
      },
    );

    expect(issues).toHaveLength(1);
    expect(issues[0]).toMatchObject({ type: "duplicate_upload", severity: "warning" });
    expect(findUploadByChecksum).toHaveBeenCalledWith("checksum-test", "org-test");
  });
});
