import { NextResponse } from "next/server";
import { getUploadById } from "@/services/upload/upload-service";

function mapProcessingStatusToStage(status: string) {
  switch (status) {
    case "uploaded":
      return "uploaded";
    case "classifying":
      return "classified";
    case "extracting":
      return "extracted";
    case "normalizing":
    case "validating":
    case "review_required":
      return "validated";
    default:
      return "completed";
  }
}

function mapProcessingStatusToProgress(status: string) {
  switch (status) {
    case "uploaded":
      return 0;
    case "classifying":
      return 20;
    case "extracting":
      return 40;
    case "normalizing":
      return 60;
    case "validating":
      return 80;
    case "review_required":
      return 90;
    default:
      return 100;
  }
}

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const upload = await getUploadById(params.id);

  if (!upload) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "NOT_FOUND",
          message: "Upload not found.",
        },
      },
      { status: 404 },
    );
  }

  return NextResponse.json({
    success: true,
    data: {
      id: upload.id,
      status: upload.processing_status,
      stage: mapProcessingStatusToStage(upload.processing_status),
      progress: mapProcessingStatusToProgress(upload.processing_status),
      classification: upload.classification,
      confidence: upload.confidence_score,
    },
  });
}
