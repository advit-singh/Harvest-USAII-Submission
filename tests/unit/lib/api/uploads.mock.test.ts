import { describe, expect, it } from "vitest";
import {
  fetchUploads,
  fetchUploadReview,
  approveUpload,
  uploadFile,
} from "@/lib/api/uploads";
import { DEMO_ORG } from "@/lib/mocks/uploads-fixtures";

describe("uploads mock API", () => {
  it("lists uploads for demo org", async () => {
    const uploads = await fetchUploads({ organizationId: DEMO_ORG });
    expect(uploads.length).toBeGreaterThan(0);
    expect(uploads[0].fileName).toBeTruthy();
  });

  it("returns review data for pending upload", async () => {
    const review = await fetchUploadReview("upl_001");
    expect(review.uploadId).toBe("upl_001");
    expect(review.extractedEntities.length).toBeGreaterThan(0);
  });

  it("approves an upload", async () => {
    const result = await approveUpload("upl_001");
    expect(result.status).toBe("completed");
  });

  it("creates upload from file", async () => {
    const file = new File(["test,data"], "test-inventory.csv", {
      type: "text/csv",
    });
    const result = await uploadFile({
      file,
      organizationId: DEMO_ORG,
      siteId: "site_001",
    });
    expect(result.uploadId).toBeTruthy();
    expect(result.status).toBe("uploaded");
  });
});
