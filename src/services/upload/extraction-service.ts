import { createClient } from "@/lib/supabase/server";

export interface ExtractionOutput {
  raw_text: string;
  structured_json: string;
  confidence_score: number;
  model_version: string;
}

export async function extractUploadContent(storagePath: string): Promise<ExtractionOutput> {
  const supabase = await createClient();
  const { data, error } = await supabase.storage
    .from("uploads")
    .download(storagePath);

  if (error || !data) {
    throw new Error(error?.message ?? "Unable to download upload file.");
  }

  const arrayBuffer = await data.arrayBuffer();
  const decoder = new TextDecoder("utf-8", { fatal: false });
  const content = decoder.decode(new Uint8Array(arrayBuffer));
  const rawText = content.slice(0, 10000);
  const structuredJson = JSON.stringify({
    source: storagePath,
    extracted_at: new Date().toISOString(),
    content: rawText,
  });

  return {
    raw_text: rawText,
    structured_json: structuredJson,
    confidence_score: 75,
    model_version: "local-parser-v1",
  };
}
