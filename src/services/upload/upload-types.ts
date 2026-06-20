import type { ExtractedEntity } from "@/lib/ai/response-parser";

export interface NormalizedUploadPayload {
  classification: string;
  rawText: string;
  structuredJson: string;
  entities: ExtractedEntity[];
  contentType: "text" | "image" | "table";
  overallConfidence: number;
}

export function parseNormalizedPayload(structuredJson: string): NormalizedUploadPayload | null {
  try {
    const parsed = JSON.parse(structuredJson);
    return parsed as NormalizedUploadPayload;
  } catch {
    return null;
  }
}

export function buildNormalizedPayload(input: {
  classification: string;
  rawText: string;
  entities: ExtractedEntity[];
  contentType: "text" | "image" | "table";
  overallConfidence: number;
}): NormalizedUploadPayload {
  const payload: NormalizedUploadPayload = {
    classification: input.classification,
    rawText: input.rawText,
    entities: input.entities,
    contentType: input.contentType,
    overallConfidence: input.overallConfidence,
    structuredJson: "",
  };
  payload.structuredJson = JSON.stringify({
    classification: payload.classification,
    rawText: payload.rawText,
    entities: payload.entities,
    contentType: payload.contentType,
    overallConfidence: payload.overallConfidence,
  });
  return payload;
}

export function entitiesToReviewFields(entities: ExtractedEntity[]) {
  return entities.map((entity, index) => ({
    id: entity.id ?? `entity-${index}`,
    field: entity.field ?? entity.entity_type.replace(/_/g, " "),
    value: String(entity.value ?? entity.name ?? entity.quantity ?? ""),
    confidence: entity.confidence,
    editable: true,
  }));
}
