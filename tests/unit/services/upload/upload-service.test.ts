import { beforeEach, describe, expect, it, vi } from "vitest";
import { DEMO_ORG_ID, DEMO_SITE_ID } from "../../../helpers/service-fixtures";

const mockFindFirst = vi.fn();

vi.mock("@/db/client", () => ({
  db: {
    query: {
      organization_sites: { findFirst: (...args: unknown[]) => mockFindFirst(...args) },
    },
  },
}));

import { validateUploadTarget } from "@/services/upload/upload-service";

describe("upload-service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("validateUploadTarget returns true when site belongs to organization", async () => {
    mockFindFirst.mockResolvedValue({
      id: DEMO_SITE_ID,
      organization_id: DEMO_ORG_ID,
    });

    await expect(validateUploadTarget(DEMO_ORG_ID, DEMO_SITE_ID)).resolves.toBe(true);
  });

  it("validateUploadTarget returns false when site belongs to another organization", async () => {
    mockFindFirst.mockResolvedValue({
      id: DEMO_SITE_ID,
      organization_id: "other-org-id",
    });

    await expect(validateUploadTarget(DEMO_ORG_ID, DEMO_SITE_ID)).resolves.toBe(false);
  });

  it("validateUploadTarget returns false when site is not found", async () => {
    mockFindFirst.mockResolvedValue(null);

    await expect(validateUploadTarget(DEMO_ORG_ID, DEMO_SITE_ID)).resolves.toBe(false);
  });
});
