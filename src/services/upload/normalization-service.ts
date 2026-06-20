import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { memory_mappings, organizations } from "@/db/schema";
import { normalizeWithAi } from "@/services/ai/ai-service";
import { isOpenRouterConfigured } from "@/lib/ai/openrouter-client";
import type { ExtractedEntity } from "@/lib/ai/response-parser";
import { buildNormalizedPayload, type NormalizedUploadPayload } from "./upload-types";

export async function normalizeUploadContent(input: {
  classification: string;
  rawText: string;
  structuredJson: string;
  organizationId: string;
  entities?: ExtractedEntity[];
  contentType?: "text" | "image" | "table";
  overallConfidence?: number;
}): Promise<NormalizedUploadPayload> {
  let entities = input.entities ?? [];
  let contentType = input.contentType ?? "text";
  let overallConfidence = input.overallConfidence ?? 0.5;

  if (!input.entities) {
    try {
      const parsed = JSON.parse(input.structuredJson);
      entities = parsed.entities ?? [];
      contentType = parsed.contentType ?? contentType;
      overallConfidence = parsed.overallConfidence ?? overallConfidence;
    } catch {
      entities = [];
    }
  }

  const org = await db.query.organizations.findFirst({
    where: eq(organizations.id, input.organizationId),
  });

  const mappings = await db.query.memory_mappings.findMany({
    where: eq(memory_mappings.organization_id, input.organizationId),
  });

  let normalizedEntities = entities;

  if (isOpenRouterConfigured() && entities.length > 0) {
    try {
      const result = await normalizeWithAi({
        classification: input.classification,
        entities,
        unitSystem: org?.default_unit_system ?? "metric",
        memoryMappings: mappings.map((m) => ({
          source_term: m.source_term,
          canonical_term: m.canonical_term,
        })),
      });
      normalizedEntities = result.entities.map((entity) => ({
        ...entity,
        confidence: entity.confidence ?? 0.5,
      }));

      for (const applied of result.mappings_applied ?? []) {
        await db
          .insert(memory_mappings)
          .values({
            organization_id: input.organizationId,
            source_term: applied.source,
            canonical_term: applied.canonical,
            mapping_type: "item_name",
            confidence_score: 80,
            times_used: 1,
          })
          .onConflictDoNothing();
      }
    } catch {
      normalizedEntities = applyMemoryMappings(entities, mappings);
    }
  } else {
    normalizedEntities = applyMemoryMappings(entities, mappings);
  }

  return buildNormalizedPayload({
    classification: input.classification,
    rawText: input.rawText.trim(),
    entities: normalizedEntities,
    contentType,
    overallConfidence,
  });
}

function applyMemoryMappings(
  entities: ExtractedEntity[],
  mappings: Array<{ source_term: string; canonical_term: string }>,
): ExtractedEntity[] {
  const map = new Map(
    mappings.map((m) => [m.source_term.toLowerCase(), m.canonical_term]),
  );

  return entities.map((entity) => {
    const name = entity.name?.toLowerCase();
    if (name && map.has(name)) {
      return { ...entity, name: map.get(name), value: map.get(name) };
    }
    return entity;
  });
}
