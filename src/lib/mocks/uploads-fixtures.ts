import type {
  ApproveUploadPayload,
  ExtractedEntity,
  UploadClassification,
  UploadReview,
  UploadStatus,
  UploadSummary,
  ValidationAnomaly,
} from "@/types/upload";

const DEMO_ORG = "org_demo_123";
const DEMO_SITE_ID = "site_001";
const DEMO_SITE_NAME = "Lincoln Elementary Cafeteria";

const STATUS_PROGRESSION: UploadStatus[] = [
  "uploaded",
  "classifying",
  "extracting",
  "normalizing",
  "validating",
  "review_required",
];

const PROGRESS_BY_STATUS: Record<UploadStatus, number> = {
  uploaded: 10,
  classifying: 25,
  extracting: 45,
  normalizing: 65,
  validating: 85,
  review_required: 92,
  completed: 100,
  failed: 0,
  rejected: 0,
};

const STAGE_BY_STATUS: Record<UploadStatus, UploadSummary["stage"]> = {
  uploaded: "uploaded",
  classifying: "classified",
  extracting: "extracted",
  normalizing: "extracted",
  validating: "validated",
  review_required: "validated",
  completed: "completed",
  failed: "uploaded",
  rejected: "validated",
};

let mockUploads: UploadSummary[] = [
  {
    id: "upl_001",
    organizationId: DEMO_ORG,
    siteId: DEMO_SITE_ID,
    siteName: DEMO_SITE_NAME,
    fileName: "inventory-march-2026.csv",
    fileType: "text/csv",
    fileSize: 245760,
    status: "review_required",
    stage: "validated",
    progress: 92,
    classification: "inventory_sheet",
    confidence: 0.87,
    description: "Monthly inventory count",
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    updatedAt: new Date(Date.now() - 1800000).toISOString(),
  },
  {
    id: "upl_002",
    organizationId: DEMO_ORG,
    siteId: DEMO_SITE_ID,
    siteName: DEMO_SITE_NAME,
    fileName: "attendance-week12.xlsx",
    fileType:
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    fileSize: 128000,
    status: "extracting",
    stage: "extracted",
    progress: 45,
    classification: "attendance_report",
    confidence: 0.72,
    createdAt: new Date(Date.now() - 900000).toISOString(),
    updatedAt: new Date(Date.now() - 300000).toISOString(),
  },
  {
    id: "upl_003",
    organizationId: DEMO_ORG,
    siteId: DEMO_SITE_ID,
    siteName: DEMO_SITE_NAME,
    fileName: "receipt-vendor-042.pdf",
    fileType: "application/pdf",
    fileSize: 512000,
    status: "completed",
    stage: "completed",
    progress: 100,
    classification: "receipt",
    confidence: 0.94,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 82800000).toISOString(),
  },
  {
    id: "upl_004",
    organizationId: DEMO_ORG,
    siteId: DEMO_SITE_ID,
    siteName: DEMO_SITE_NAME,
    fileName: "damaged-scan.png",
    fileType: "image/png",
    fileSize: 2048000,
    status: "failed",
    stage: "uploaded",
    progress: 0,
    classification: "unknown",
    confidence: 0,
    failureReason: "Unable to read image — file may be corrupt or too low resolution.",
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    updatedAt: new Date(Date.now() - 172700000).toISOString(),
  },
  {
    id: "upl_005",
    organizationId: DEMO_ORG,
    siteId: DEMO_SITE_ID,
    siteName: DEMO_SITE_NAME,
    fileName: "waste-log-april.csv",
    fileType: "text/csv",
    fileSize: 89000,
    status: "rejected",
    stage: "validated",
    progress: 0,
    classification: "waste_report",
    confidence: 0.61,
    failureReason: "Rejected by reviewer — duplicate entries detected.",
    createdAt: new Date(Date.now() - 259200000).toISOString(),
    updatedAt: new Date(Date.now() - 258000000).toISOString(),
  },
];

let mockAnomalies: ValidationAnomaly[] = [
  {
    id: "anom_001",
    uploadId: "upl_001",
    type: "inventory_conflict",
    severity: "warning",
    reason: "Milk quantity (48 units) exceeds typical weekly usage by 35%.",
    confidence: 0.82,
    suggestedFix: "Verify count or check for duplicate line items.",
    status: "open",
  },
  {
    id: "anom_002",
    uploadId: "upl_001",
    type: "cost_outlier",
    severity: "informational",
    reason: "Produce cost per unit is 22% above 90-day average.",
    confidence: 0.71,
    suggestedFix: "Confirm vendor pricing or seasonal adjustment.",
    status: "open",
  },
  {
    id: "anom_003",
    uploadId: "upl_002",
    type: "attendance_spike",
    severity: "critical",
    reason: "Tuesday attendance (842) is 48% above rolling average.",
    confidence: 0.91,
    suggestedFix: "Confirm event schedule or correct data entry.",
    status: "open",
  },
];

const REVIEW_ENTITIES: Record<string, ExtractedEntity[]> = {
  upl_001: [
    { id: "ent_1", field: "Item", value: "Whole milk (1 gal)", confidence: 0.95, editable: true },
    { id: "ent_2", field: "Quantity", value: "48 units", confidence: 0.88, editable: true },
    { id: "ent_3", field: "Expiration", value: "2026-03-28", confidence: 0.92, editable: true },
    { id: "ent_4", field: "Location", value: "Walk-in cooler A", confidence: 0.79, editable: true },
    { id: "ent_5", field: "Cost", value: "$2.89/unit", confidence: 0.85, editable: true },
  ],
  upl_002: [
    { id: "ent_6", field: "Date", value: "2026-03-18", confidence: 0.9, editable: true },
    { id: "ent_7", field: "Attendance", value: "842", confidence: 0.72, editable: true },
    { id: "ent_8", field: "Meals served", value: "798", confidence: 0.68, editable: true },
  ],
};

const processingTimers = new Map<string, ReturnType<typeof setTimeout>>();

function inferClassification(fileName: string): UploadClassification {
  const lower = fileName.toLowerCase();
  if (lower.includes("inventory")) return "inventory_sheet";
  if (lower.includes("attendance")) return "attendance_report";
  if (lower.includes("receipt")) return "receipt";
  if (lower.includes("waste")) return "waste_report";
  if (lower.includes("donation")) return "donation_log";
  if (lower.includes("invoice")) return "invoice";
  return "unknown";
}

function scheduleProcessingAdvance(uploadId: string): void {
  const existing = processingTimers.get(uploadId);
  if (existing) clearTimeout(existing);

  const upload = mockUploads.find((u) => u.id === uploadId);
  if (!upload || upload.status === "completed" || upload.status === "failed" || upload.status === "rejected") {
    return;
  }

  const currentIndex = STATUS_PROGRESSION.indexOf(upload.status);
  if (currentIndex < 0 || currentIndex >= STATUS_PROGRESSION.length - 1) {
    return;
  }

  const timer = setTimeout(() => {
    processingTimers.delete(uploadId);
    const idx = mockUploads.findIndex((u) => u.id === uploadId);
    if (idx === -1) return;

    const nextStatus = STATUS_PROGRESSION[currentIndex + 1];
    mockUploads[idx] = {
      ...mockUploads[idx],
      status: nextStatus,
      stage: STAGE_BY_STATUS[nextStatus],
      progress: PROGRESS_BY_STATUS[nextStatus],
      updatedAt: new Date().toISOString(),
    };

    if (nextStatus !== "review_required") {
      scheduleProcessingAdvance(uploadId);
    }
  }, 800);

  processingTimers.set(uploadId, timer);
}

export function resetMockUploads(): void {
  processingTimers.forEach((t) => clearTimeout(t));
  processingTimers.clear();
  mockUploads = [];
  mockAnomalies = [];
}

export function getMockUploads(orgId?: string): UploadSummary[] {
  if (!orgId) return [...mockUploads];
  return mockUploads.filter((u) => u.organizationId === orgId);
}

export function getMockUploadById(id: string): UploadSummary | undefined {
  return mockUploads.find((u) => u.id === id);
}

export function getMockAnomalies(uploadId?: string): ValidationAnomaly[] {
  if (!uploadId) return [...mockAnomalies];
  return mockAnomalies.filter((a) => a.uploadId === uploadId);
}

export function getMockUploadReview(uploadId: string): UploadReview | null {
  const upload = getMockUploadById(uploadId);
  if (!upload) return null;

  const entities = REVIEW_ENTITIES[uploadId] ?? [
    {
      id: `ent_${uploadId}`,
      field: "Content",
      value: "Extracted data pending review",
      confidence: upload.confidence,
      editable: true,
    },
  ];

  return {
    uploadId,
    fileName: upload.fileName,
    originalContent: `Original file: ${upload.fileName}\n\nSample extracted content for demo purposes.\nClassification: ${upload.classification}`,
    originalContentType: upload.fileType.startsWith("image/") ? "image" : "text",
    extractedEntities: entities,
    validationIssues: getMockAnomalies(uploadId),
    overallConfidence: upload.confidence,
    classification: upload.classification,
  };
}

export function createMockUpload(input: {
  organizationId: string;
  siteId: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  description?: string;
}): UploadSummary {
  const id = `upl_${Date.now()}`;
  const classification = inferClassification(input.fileName);
  const upload: UploadSummary = {
    id,
    organizationId: input.organizationId,
    siteId: input.siteId,
    siteName: DEMO_SITE_NAME,
    fileName: input.fileName,
    fileType: input.fileType,
    fileSize: input.fileSize,
    status: "uploaded",
    stage: "uploaded",
    progress: PROGRESS_BY_STATUS.uploaded,
    classification,
    confidence: 0,
    description: input.description,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  mockUploads = [upload, ...mockUploads];
  return upload;
}

export function triggerMockProcessing(uploadId: string): UploadSummary | null {
  const upload = getMockUploadById(uploadId);
  if (!upload) return null;
  if (upload.status !== "uploaded") return upload;

  scheduleProcessingAdvance(uploadId);
  return getMockUploadById(uploadId) ?? null;
}

export function advanceMockUploadStatus(uploadId: string): UploadSummary | null {
  const idx = mockUploads.findIndex((u) => u.id === uploadId);
  if (idx === -1) return null;

  const upload = mockUploads[idx];
  const currentIndex = STATUS_PROGRESSION.indexOf(upload.status);
  if (currentIndex < 0 || currentIndex >= STATUS_PROGRESSION.length - 1) {
    return upload;
  }

  const nextStatus = STATUS_PROGRESSION[currentIndex + 1];
  mockUploads[idx] = {
    ...upload,
    status: nextStatus,
    stage: STAGE_BY_STATUS[nextStatus],
    progress: PROGRESS_BY_STATUS[nextStatus],
    updatedAt: new Date().toISOString(),
  };
  return mockUploads[idx];
}

export function approveMockUpload(
  uploadId: string,
  payload?: ApproveUploadPayload,
): UploadSummary | null {
  const idx = mockUploads.findIndex((u) => u.id === uploadId);
  if (idx === -1) return null;

  if (payload?.entities) {
    const entities = REVIEW_ENTITIES[uploadId];
    if (entities) {
      for (const edit of payload.entities) {
        const entity = entities.find((e) => e.id === edit.id);
        if (entity) entity.value = edit.value;
      }
    }
  }

  mockUploads[idx] = {
    ...mockUploads[idx],
    status: "completed",
    stage: "completed",
    progress: 100,
    confidence: Math.max(mockUploads[idx].confidence, 0.9),
    updatedAt: new Date().toISOString(),
  };

  mockAnomalies = mockAnomalies.map((a) =>
    a.uploadId === uploadId && a.status === "open"
      ? { ...a, status: "accepted" as const }
      : a,
  );

  return mockUploads[idx];
}

export function rejectMockUpload(
  uploadId: string,
  reason: string,
): UploadSummary | null {
  const idx = mockUploads.findIndex((u) => u.id === uploadId);
  if (idx === -1) return null;

  mockUploads[idx] = {
    ...mockUploads[idx],
    status: "rejected",
    stage: "validated",
    progress: 0,
    failureReason: reason,
    updatedAt: new Date().toISOString(),
  };
  return mockUploads[idx];
}

export function resolveMockAnomaly(
  anomalyId: string,
  action: "accepted" | "corrected" | "ignored",
  correctedValue?: string,
): ValidationAnomaly | null {
  const idx = mockAnomalies.findIndex((a) => a.id === anomalyId);
  if (idx === -1) return null;
  mockAnomalies[idx] = {
    ...mockAnomalies[idx],
    status: action,
    ...(correctedValue ? { correctedValue } : {}),
  };
  return mockAnomalies[idx];
}

export function getPendingReviewUploads(orgId: string): UploadSummary[] {
  return mockUploads.filter(
    (u) => u.organizationId === orgId && u.status === "review_required",
  );
}

export { DEMO_ORG, DEMO_SITE_ID, DEMO_SITE_NAME };
