export async function parsePdfContent(buffer: ArrayBuffer): Promise<string> {
  const pdfParse = (await import("pdf-parse")).default;
  const result = await pdfParse(Buffer.from(buffer));
  return (result.text ?? "").slice(0, 50000);
}
