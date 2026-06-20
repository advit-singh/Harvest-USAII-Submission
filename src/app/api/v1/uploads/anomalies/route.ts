import { NextResponse } from "next/server";
import { listUploadAnomalies } from "@/services/upload/upload-service";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const organizationId = url.searchParams.get("organizationId");

  if (!organizationId) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "organizationId is required.",
        },
      },
      { status: 400 },
    );
  }

  const anomalies = await listUploadAnomalies(organizationId);
  return NextResponse.json({ success: true, data: anomalies });
}
