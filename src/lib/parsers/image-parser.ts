import { ocrImageWithAi } from "@/services/ai/ai-service";
import { isOpenRouterConfigured } from "@/lib/ai/openrouter-client";

export async function parseImageContent(
  buffer: ArrayBuffer,
  mimeType: string,
): Promise<string> {
  if (isOpenRouterConfigured()) {
    const base64 = Buffer.from(buffer).toString("base64");
    return ocrImageWithAi(base64, mimeType);
  }

  return "[Image content — configure OPENROUTER_API_KEY for OCR]";
}
