import { NextResponse } from "next/server";
import { resolveValidationAnomaly } from "@/services/upload/anomaly-service";

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const payload = await request.json();
  const action = payload?.action;

  if (!action || !["accepted", "corrected", "ignored"].includes(action)) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Invalid anomaly action.",
        },
      },
      { status: 400 },
    );
  }

  const resolved = await resolveValidationAnomaly(params.id, action);
  if (!resolved) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "NOT_FOUND",
          message: "Validation anomaly not found.",
        },
      },
      { status: 404 },
    );
  }

  return NextResponse.json({ success: true, data: resolved });
}
