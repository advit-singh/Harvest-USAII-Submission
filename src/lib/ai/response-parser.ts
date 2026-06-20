import { z } from "zod";

export function extractJsonFromText(text: string): string {
  const trimmed = text.trim();
  if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
    return trimmed;
  }

  const fenceMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenceMatch?.[1]) {
    return fenceMatch[1].trim();
  }

  const objectMatch = trimmed.match(/\{[\s\S]*\}/);
  if (objectMatch) {
    return objectMatch[0];
  }

  return trimmed;
}

export function parseJsonResponse<T>(text: string, schema: z.ZodType<T>): T {
  const jsonText = extractJsonFromText(text);
  const parsed = JSON.parse(jsonText);
  return schema.parse(parsed);
}

export const classificationResponseSchema = z.object({
  classification: z.enum([
    "receipt",
    "invoice",
    "inventory_sheet",
    "attendance_report",
    "waste_report",
    "donation_log",
    "event_plan",
    "mixed",
    "unknown",
  ]),
  confidence: z.number().min(0).max(1),
  reasoning: z.string().optional(),
});

export const extractedEntitySchema = z.object({
  id: z.string().optional(),
  entity_type: z.enum([
    "inventory_item",
    "purchase",
    "vendor",
    "attendance_record",
    "donation",
    "waste_event",
    "cost",
    "menu_item",
    "location",
    "event",
    "date",
    "quantity",
    "expiration_date",
    "storage_location",
    "food_category",
  ]),
  name: z.string().optional(),
  value: z.union([z.string(), z.number()]).optional(),
  quantity: z.number().optional(),
  unit: z.string().optional(),
  date: z.string().optional(),
  cost: z.number().optional(),
  category: z.string().optional(),
  location: z.string().optional(),
  confidence: z.number().min(0).max(1).default(0.5),
  field: z.string().optional(),
});

export const extractionResponseSchema = z.object({
  entities: z.array(extractedEntitySchema),
  summary: z.string().optional(),
  overall_confidence: z.number().min(0).max(1).optional(),
});

export const normalizationResponseSchema = z.object({
  entities: z.array(extractedEntitySchema),
  mappings_applied: z
    .array(
      z.object({
        source: z.string(),
        canonical: z.string(),
      }),
    )
    .optional(),
});

export type ClassificationResponse = z.infer<typeof classificationResponseSchema>;
export type ExtractedEntity = z.infer<typeof extractedEntitySchema>;
export type ExtractionResponse = z.infer<typeof extractionResponseSchema>;
export type NormalizationResponse = z.infer<typeof normalizationResponseSchema>;
