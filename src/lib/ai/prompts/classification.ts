export function buildClassificationPrompt(input: {
  fileName: string;
  fileType: string;
  description?: string;
  contentPreview: string;
}): string {
  return `Classify this uploaded document for a food waste intelligence platform.

File name: ${input.fileName}
File type: ${input.fileType}
Description: ${input.description ?? "none"}

Content preview:
${input.contentPreview.slice(0, 3000)}

Respond with JSON only:
{
  "classification": "receipt|invoice|inventory_sheet|attendance_report|waste_report|donation_log|event_plan|mixed|unknown",
  "confidence": 0.0-1.0,
  "reasoning": "brief explanation"
}`;
}
