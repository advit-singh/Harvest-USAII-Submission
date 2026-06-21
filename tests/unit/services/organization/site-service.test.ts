import { describe, expect, it } from "vitest";
import { listSitesForOrg } from "@/services/organization/site-service";

describe("site-service", () => {
  it("exports listSitesForOrg function", () => {
    expect(typeof listSitesForOrg).toBe("function");
  });
});
