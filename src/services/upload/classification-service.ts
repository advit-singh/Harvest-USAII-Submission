export interface UploadMetadata {
  file_name: string;
  file_type: string;
  description?: string;
}

export interface ClassificationResult {
  classification: "receipt" | "inventory_sheet" | "attendance_report" | "donation_log" | "waste_report" | "invoice" | "mixed" | "unknown";
  confidence: number;
}

const classificationMap: Record<string, ClassificationResult["classification"]> = {
  receipt: "receipt",
  invoice: "invoice",
  inventory: "inventory_sheet",
  attendance: "attendance_report",
  donation: "donation_log",
  waste: "waste_report",
  food: "inventory_sheet",
  log: "donation_log",
};

export async function classifyUpload(
  upload: UploadMetadata,
): Promise<ClassificationResult> {
  const fileName = upload.file_name.toLowerCase();
  const type = upload.file_type.toLowerCase();
  const description = upload.description?.toLowerCase() ?? "";

  const sourceText = `${fileName} ${type} ${description}`;

  for (const keyword of Object.keys(classificationMap)) {
    if (sourceText.includes(keyword)) {
      return {
        classification: classificationMap[keyword],
        confidence: 90,
      };
    }
  }

  if (type.includes("invoice") || fileName.includes("invoice")) {
    return { classification: "invoice", confidence: 85 };
  }

  if (type.includes("csv") || type.includes("spreadsheet")) {
    return { classification: "inventory_sheet", confidence: 80 };
  }

  return { classification: "unknown", confidence: 50 };
}
