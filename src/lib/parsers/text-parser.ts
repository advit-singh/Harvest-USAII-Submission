export function parseTextContent(buffer: ArrayBuffer): string {
  const decoder = new TextDecoder("utf-8", { fatal: false });
  return decoder.decode(new Uint8Array(buffer)).slice(0, 50000);
}
