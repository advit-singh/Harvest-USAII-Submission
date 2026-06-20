import { describe, expect, it } from "vitest";
import {
  uploadFiltersSchema,
  DEFAULT_UPLOAD_FILTERS,
} from "@/features/uploads/schemas/upload-filters.schema";
import { toUploadFilters } from "@/features/uploads/config/upload-tabs";

describe("upload-filters.schema", () => {
  it("parses default filters", () => {
    const parsed = uploadFiltersSchema.parse({});
    expect(parsed.status).toBe("all");
    expect(parsed.siteId).toBe("all");
  });

  it("converts to API filters", () => {
    const api = toUploadFilters(
      { ...DEFAULT_UPLOAD_FILTERS, search: "inventory" },
      "org_demo_123",
    );
    expect(api.organizationId).toBe("org_demo_123");
    expect(api.search).toBe("inventory");
    expect(api.siteId).toBeUndefined();
  });
});
