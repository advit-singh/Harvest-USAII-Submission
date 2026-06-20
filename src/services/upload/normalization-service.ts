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
  return {
    classification: input.classification,
    rawText: input.rawText.trim(),
    structuredJson: input.structuredJson,
  };
}
