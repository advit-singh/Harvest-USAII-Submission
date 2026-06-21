import { describe, expect, it } from "vitest";
import { flattenSearchResults } from "@/features/navigation/hooks/useGlobalSearch";

describe("global search helpers", () => {
  it("flattens search result groups", () => {
    const flat = flattenSearchResults({
      inventory: [{ id: "1", type: "inventory", title: "Milk", href: "/a" }],
      forecasts: [],
      reports: [],
      recommendations: [],
      uploads: [],
      conversations: [],
    });
    expect(flat).toHaveLength(1);
    expect(flat[0]?.title).toBe("Milk");
  });
});
