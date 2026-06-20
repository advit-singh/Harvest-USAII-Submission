export interface NormalizedUpload {
  classification: string;
  rawText: string;
  structuredJson: string;
}

export function normalizeUploadContent(input: {
  classification: string;
  rawText: string;
  structuredJson: string;
}): NormalizedUpload {
  const normalizedText = input.rawText.trim();
  let parsedJson;

  try {
    parsedJson = JSON.parse(input.structuredJson);
  } catch {
    parsedJson = { original: input.structuredJson };
  }

  const structuredJson = JSON.stringify({
    classification: input.classification,
    normalized_at: new Date().toISOString(),
    raw_text: normalizedText,
    extracted: parsedJson,
  });

  return {
    classification: input.classification,
    rawText: normalizedText,
    structuredJson,
  };
}
