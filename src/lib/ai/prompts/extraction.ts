export function buildExtractionPrompt(input: {
  classification: string;
  content: string;
}): string {
  return `Extract structured operational entities from this ${input.classification} document for a food service organization.

Document content:
${input.content.slice(0, 12000)}

Extract inventory items, purchases, attendance, waste events, donations, events, costs, dates, quantities, units, expiration dates, and locations.

Respond with JSON only:
{
  "entities": [
    {
      "entity_type": "inventory_item|purchase|vendor|attendance_record|donation|waste_event|cost|menu_item|location|event|date|quantity|expiration_date|storage_location|food_category",
      "name": "string",
      "value": "string or number",
      "quantity": number,
      "unit": "string",
      "date": "ISO date string",
      "cost": number,
      "category": "string",
      "location": "string",
      "confidence": 0.0-1.0,
      "field": "human readable field label"
    }
  ],
  "summary": "brief summary",
  "overall_confidence": 0.0-1.0
}`;
}
