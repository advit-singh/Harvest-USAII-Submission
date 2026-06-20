export function buildNormalizationPrompt(input: {
  classification: string;
  entities: unknown[];
  unitSystem: string;
  memoryMappings: Array<{ source_term: string; canonical_term: string }>;
}): string {
  const mappings =
    input.memoryMappings.length > 0
      ? `Known organization mappings:\n${input.memoryMappings.map((m) => `- "${m.source_term}" → "${m.canonical_term}"`).join("\n")}`
      : "No organization memory mappings yet.";

  return `Normalize extracted food service data to a canonical operational model.

Classification: ${input.classification}
Organization unit system: ${input.unitSystem}

${mappings}

Entities to normalize:
${JSON.stringify(input.entities, null, 2).slice(0, 10000)}

Tasks:
1. Standardize food item names and categories (e.g. "Whole Milk", "2% Milk" → consistent names)
2. Normalize units to ${input.unitSystem} (kg/lbs, liters/gallons, cartons, cases)
3. Normalize dates to ISO 8601
4. Normalize location names

Respond with JSON only:
{
  "entities": [ same entity schema as input, normalized ],
  "mappings_applied": [{ "source": "original term", "canonical": "normalized term" }]
}`;
}
