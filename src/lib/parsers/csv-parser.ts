export function parseCsvContent(text: string): string {
  const lines = text.split(/\r?\n/).filter((line) => line.trim().length > 0);
  const preview = lines.slice(0, 200).join("\n");
  return `CSV Data (${lines.length} rows):\n${preview}`;
}
