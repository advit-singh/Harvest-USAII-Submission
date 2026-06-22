import { createClient } from "@/lib/supabase/server";
import { parseFileContent } from "@/lib/parsers";
import { extractWithAi } from "@/services/ai/ai-service";
import { isAiConfigured } from "@/services/ai/ai-service";
import type { ExtractedEntity } from "@/lib/ai/response-parser";
import { toDbConfidence } from "@/lib/api/confidence";

export interface ExtractionOutput {
  raw_text: string;
  structured_json: string;
  confidence_score: number;
  model_version: string;
  content_type: "text" | "image" | "table";
  entities: ExtractedEntity[];
}

export async function extractUploadContent(
  storagePath: string,
  classification = "unknown",
): Promise<ExtractionOutput> {
  const supabase = await createClient();
  const { data, error } = await supabase.storage.from("uploads").download(storagePath);

  if (error || !data) {
    throw new Error(error?.message ?? "Unable to download upload file.");
  }

  const arrayBuffer = await data.arrayBuffer();
  const fileName = storagePath.split("/").pop() ?? "upload";
  const fileType = data.type || "application/octet-stream";

  const parsed = await parseFileContent(arrayBuffer, fileType, fileName);
  const rawText = parsed.rawText.slice(0, 50000);

  let entities: ExtractedEntity[] = [];
  let overallConfidence = 0.5;
  let modelVersion = "local-parser-v1";

  if (isAiConfigured() && rawText.length > 0) {
    try {
      const extraction = await extractWithAi({
        classification,
        content: rawText,
      });
      entities = extraction.entities.map((entity, index) => ({
        ...entity,
        id: entity.id ?? `entity-${index}`,
        confidence: entity.confidence ?? 0.5,
      }));
      overallConfidence = extraction.overall_confidence ?? 0.7;
      modelVersion = "openrouter-gemini-v1";
    } catch {
      entities = buildFallbackEntities(rawText);
      overallConfidence = 0.4;
    }
  } else {
    entities = buildFallbackEntities(rawText);
  }

  const structuredJson = JSON.stringify({
    classification,
    rawText,
    entities,
    contentType: parsed.contentType,
    overallConfidence,
  });

  return {
    raw_text: rawText,
    structured_json: structuredJson,
    confidence_score: toDbConfidence(overallConfidence),
    model_version: modelVersion,
    content_type: parsed.contentType,
    entities,
  };
}

function buildFallbackEntities(rawText: string): ExtractedEntity[] {
  const lines = rawText.split(/\r?\n/).filter((line) => line.trim().length > 0);
  return lines.slice(0, 20).map((line, index) => ({
    id: `entity-${index}`,
    entity_type: "inventory_item" as const,
    name: line.slice(0, 120),
    value: line.slice(0, 120),
    field: `Line ${index + 1}`,
    confidence: 0.35,
  }));
}
