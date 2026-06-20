import { NextResponse } from "next/server";
import { getUploadReview } from "@/services/upload/upload-service";

function mapUploadReview(review: any) {
  const upload = review.upload;
  const extraction = review.extractions?.[0];

  return {
    uploadId: upload.id,
    fileName: upload.file_name,
    originalContent: extraction?.raw_text ?? extraction?.structured_json ?? "",
    originalContentType: "text",
    extractedEntities: [],
    validationIssues: review.anomalies.map((anomaly: any) => ({
      id: anomaly.id,
      uploadId: anomaly.upload_id,
      type: anomaly.type,
      severity: anomaly.severity,
      reason: anomaly.reason,
      confidence: anomaly.confidence,
      suggestedFix: anomaly.suggested_fix,
      status: anomaly.status,
    })),
    overallConfidence: upload.confidence_score / 100,
    classification: upload.classification,
  };
}

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const review = await getUploadReview(params.id);

  if (!review) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "NOT_FOUND",
          message: "Upload review not found.",
        },
      },
      { status: 404 },
    );
  }

  return NextResponse.json({ success: true, data: mapUploadReview(review) });
}
