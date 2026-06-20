import { describe, expect, it } from "vitest";
import { parseCsvContent } from "@/lib/parsers/csv-parser";
import { parseTextContent } from "@/lib/parsers/text-parser";
import { parseFileContent } from "@/lib/parsers";

describe("file parsers", () => {
  it("parses text content", () => {
    const buffer = new TextEncoder().encode("Milk,50,cartons").buffer;
    expect(parseTextContent(buffer)).toContain("Milk");
  });

  it("formats csv content with row count", () => {
    const csv = "item,qty\nMilk,50\nBread,20";
    expect(parseCsvContent(csv)).toContain("3 rows");
    expect(parseCsvContent(csv)).toContain("Milk");
  });

  it("parses csv file by extension", async () => {
    const buffer = new TextEncoder().encode("item,qty\nMilk,50").buffer;
    const result = await parseFileContent(buffer, "text/csv", "inventory.csv");
    expect(result.contentType).toBe("table");
    expect(result.rawText).toContain("Milk");
  });

  it("parses plain text files", async () => {
    const buffer = new TextEncoder().encode("Attendance: 450 students").buffer;
    const result = await parseFileContent(buffer, "text/plain", "notes.txt");
    expect(result.contentType).toBe("text");
    expect(result.rawText).toContain("450");
  });
});
