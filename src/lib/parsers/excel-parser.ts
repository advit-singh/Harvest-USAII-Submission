import * as XLSX from "xlsx";

export function parseExcelContent(buffer: ArrayBuffer): string {
  const workbook = XLSX.read(buffer, { type: "array" });
  const sheets: string[] = [];

  for (const sheetName of workbook.SheetNames.slice(0, 5)) {
    const sheet = workbook.Sheets[sheetName];
    if (!sheet) continue;
    const csv = XLSX.utils.sheet_to_csv(sheet);
    sheets.push(`Sheet: ${sheetName}\n${csv.slice(0, 8000)}`);
  }

  return sheets.join("\n\n") || "Empty spreadsheet";
}
