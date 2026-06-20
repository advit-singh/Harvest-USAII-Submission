import { parseCsvContent } from "./csv-parser";
import { parseExcelContent } from "./excel-parser";
import { parseImageContent } from "./image-parser";
import { parsePdfContent } from "./pdf-parser";
import { parseTextContent } from "./text-parser";

export interface ParsedFileContent {
  rawText: string;
  contentType: "text" | "image" | "table";
}

export async function parseFileContent(
  buffer: ArrayBuffer,
  fileType: string,
  fileName: string,
): Promise<ParsedFileContent> {
  const lowerType = fileType.toLowerCase();
  const lowerName = fileName.toLowerCase();

  if (lowerType.includes("pdf") || lowerName.endsWith(".pdf")) {
    return { rawText: await parsePdfContent(buffer), contentType: "text" };
  }

  if (
    lowerType.includes("spreadsheet") ||
    lowerType.includes("excel") ||
    lowerName.endsWith(".xlsx") ||
    lowerName.endsWith(".xls")
  ) {
    return { rawText: parseExcelContent(buffer), contentType: "table" };
  }

  if (lowerType.includes("csv") || lowerName.endsWith(".csv")) {
    const text = parseTextContent(buffer);
    return { rawText: parseCsvContent(text), contentType: "table" };
  }

  if (lowerType.startsWith("image/")) {
    return {
      rawText: await parseImageContent(buffer, fileType),
      contentType: "image",
    };
  }

  return { rawText: parseTextContent(buffer), contentType: "text" };
}
