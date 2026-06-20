import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getUploadById } from "@/services/upload/upload-service";
import { runUploadPipeline } from "@/services/upload/pipeline-service";

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "UNAUTHORIZED",
          message: "Authentication required.",
        },
      },
      { status: 401 },
    );
  }

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

  try {
    const result = await runUploadPipeline(params.id);
    return NextResponse.json({ success: true, data: result });
  } catch (error: unknown) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "PROCESSING_FAILED",
          message: error instanceof Error ? error.message : "Upload processing failed.",
        },
      },
      { status: 500 },
    );
  }
}
