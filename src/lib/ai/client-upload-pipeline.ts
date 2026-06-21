"use client";

import { classifyAndExtractWithAi } from "@/services/ai/ai-service";
import { parseCsvContent } from "@/lib/parsers/csv-parser";
import { parseExcelContent } from "@/lib/parsers/excel-parser";
import { parseTextContent } from "@/lib/parsers/text-parser";
import type { ExtractedEntity, UploadClassification } from "@/types/upload";

export interface MockUploadExtractionResult {
  classification: UploadClassification;
  confidence: number;
  entities: ExtractedEntity[];
  originalContent: string;
  summary?: string;
}

function mapEntities(
  raw: Array<{
    entity_type?: string;
    field?: string;
    name?: string;
    value?: string | number;
    quantity?: number;
    unit?: string;
    confidence?: number;
  }>,
  uploadId: string,
): ExtractedEntity[] {
  return raw.map((entity, index) => ({
    id: `ent_${uploadId}_${index}`,
    field:
      entity.field ??
      entity.name ??
      entity.entity_type?.replace(/_/g, " ") ??
      "Field",
    value: String(
      entity.value ??
        (entity.quantity != null
          ? `${entity.quantity}${entity.unit ? ` ${entity.unit}` : ""}`
          : ""),
    ),
    confidence: entity.confidence ?? 0.75,
    editable: true,
  }));
}

async function readFileContent(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const lowerName = file.name.toLowerCase();
  const lowerType = file.type.toLowerCase();

  if (
    lowerType.includes("spreadsheet") ||
    lowerType.includes("excel") ||
    lowerName.endsWith(".xlsx") ||
    lowerName.endsWith(".xls")
  ) {
    return parseExcelContent(buffer);
  }

  if (lowerType.includes("csv") || lowerName.endsWith(".csv")) {
    return parseCsvContent(parseTextContent(buffer));
  }

  return parseTextContent(buffer);
}

export async function processMockUploadFile(
  file: File,
  uploadId: string,
): Promise<MockUploadExtractionResult> {
  const content = (await readFileContent(file)).slice(0, 4000);

  try {
    const result = await classifyAndExtractWithAi({
      fileName: file.name,
      fileType: file.type || "application/octet-stream",
      content,
    });

    const entities = mapEntities(result.entities ?? [], uploadId);

    return {
      classification: result.classification as UploadClassification,
      confidence: result.overall_confidence ?? result.confidence ?? 0.8,
      entities:
        entities.length > 0
          ? entities
          : [
              {
                id: `ent_${uploadId}_0`,
                field: "Summary",
                value: result.summary ?? "Extracted content",
                confidence: 0.6,
                editable: true,
              },
            ],
      originalContent: content,
      summary: result.summary,
    };
  } catch {
    const classification = inferClassificationFromName(file.name);
    const lines = content.split("\n").filter((l) => l.trim()).slice(1, 6);
    const entities: ExtractedEntity[] = lines.map((line, index) => ({
      id: `ent_${uploadId}_${index}`,
      field: `Row ${index + 1}`,
      value: line.trim(),
      confidence: 0.5,
      editable: true,
    }));

    return {
      classification,
      confidence: 0.5,
      entities:
        entities.length > 0
          ? entities
          : [
              {
                id: `ent_${uploadId}_0`,
                field: "Content",
                value: content.slice(0, 200),
                confidence: 0.4,
                editable: true,
              },
            ],
      originalContent: content,
    };
  }
}

function inferClassificationFromName(fileName: string): UploadClassification {
  const lower = fileName.toLowerCase();
  if (lower.includes("inventory")) return "inventory_sheet";
  if (lower.includes("attendance")) return "attendance_report";
  if (lower.includes("receipt")) return "receipt";
  if (lower.includes("waste")) return "waste_report";
  if (lower.includes("donation")) return "donation_log";
  if (lower.includes("invoice")) return "invoice";
  return "unknown";
}
