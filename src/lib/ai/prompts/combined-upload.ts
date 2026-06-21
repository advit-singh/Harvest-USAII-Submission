export function buildCombinedUploadPrompt(input: {
  fileName: string;
  fileType: string;
  description?: string;
  content: string;
}): string {
  const preview = input.content.slice(0, 4000);
  return `Classify and extract from this food-service document.

File: ${input.fileName} (${input.fileType})
${input.description ? `Notes: ${input.description}` : ""}

Content:
${preview}

JSON only:
{
  "classification": "receipt|invoice|inventory_sheet|attendance_report|waste_report|donation_log|event_plan|mixed|unknown",
  "confidence": 0.0-1.0,
  "entities": [
    {
      "entity_type": "inventory_item|purchase|vendor|attendance_record|donation|waste_event|cost|menu_item|location|event|date|quantity|expiration_date|storage_location|food_category",
      "field": "label",
      "name": "string",
      "value": "string or number",
      "quantity": number,
      "unit": "string",
      "confidence": 0.0-1.0
    }
  ],
  "summary": "brief",
  "overall_confidence": 0.0-1.0
}`;
}
