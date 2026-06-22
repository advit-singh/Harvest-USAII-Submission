import { ocrImageWithAi, isAiConfigured } from "@/services/ai/ai-service";

export async function parseImageContent(
  buffer: ArrayBuffer,
  mimeType: string,
): Promise<string> {
  if (isAiConfigured()) {
    const base64 = Buffer.from(buffer).toString("base64");
    return ocrImageWithAi(base64, mimeType);
  }

  return "[Image content — configure GEMINI_API_KEY for OCR]";
}
